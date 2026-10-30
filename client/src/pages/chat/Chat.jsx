import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { sendMessage, getChatHistory, completeRequest, getRequestById, replaceMentor } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/format';

// Docker-first : via Nginx (8082) on passe par le proxy /socket.io/ même origine, en dev on garde 5000
const getSocketURL = () => {
    if (typeof window !== 'undefined' && (window.location.port === '8082' || window.location.port === '80')) return window.location.origin;
    return 'http://localhost:5000';
};
const SOCKET_URL = getSocketURL();

export default function Chat() {
    const { requestId }         = useParams();
    const navigate              = useNavigate();
    const { user: currentUser, updateUser } = useAuth();
    const { t, i18n } = useTranslation();
    const lang = (currentUser?.preferredLang || i18n.language || 'fr').slice(0, 2);
    const bottomRef             = useRef(null);
    const fileInputRef          = useRef(null);
    const socketRef             = useRef(null);

    const [requestData, setRequestData]     = useState(null);
    const [isApprenant, setIsApprenant]     = useState(false);
    const [isMentor, setIsMentor]           = useState(false);
    const [loadingRequest, setLoadingRequest] = useState(true);

    const [messages, setMessages]           = useState([]);
    const [input, setInput]                 = useState('');
    const [loading, setLoading]             = useState(false);
    const [showRating, setShowRating]       = useState(false);
    const [rating, setRating]               = useState(0);
    const [hoverRating, setHoverRating]     = useState(0);
    const [completing, setCompleting]       = useState(false);
    const [replacing, setReplacing]         = useState(false);
    const [blocked, setBlocked] = useState(false);
        const [sessionEnded, setSessionEnded] = useState(false);
        const [showOriginal, setShowOriginal] = useState({});

    // ── Charger les infos de la demande ──
    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await getRequestById(requestId);
                const req = res.data.request;
                setRequestData(req);
                const myId = currentUser?.id;
                setIsApprenant(req.requesterId?.toString() === myId);
                setIsMentor(req.mentorId?.toString() === myId);

                // Charger l'historique persistant des messages + traduction dans ma langue
                                try {
                                    const histRes = await getChatHistory(requestId);
                                    if (histRes.data?.messages) {
                                        const myLang = currentUser?.preferredLang || 'fr';
                                        const mapped = histRes.data.messages.map(m => {
                                            let tr = m.content_translated || m.translated || null;
                                            if (!tr && m.translations) {
                                                tr = m.translations[myLang] || m.translations?.ja || m.translations?.fr || null;
                                            }
                                            return {
                                                id: m._id,
                                                content: m.content,
                                                content_translated: tr,
                                                translated: tr,
                                                engine: m.engine || null,
                                                type: m.type || 'text',
                                                url: m.fileUrl,
                                                isMe: m.senderId?.toString() === myId,
                                                username: m.senderUsername,
                                                time: formatTime(m.createdAt, lang)
                                            };
                                        });
                                        setMessages(mapped);
                                    }
                                } catch (historyErr) {
                                    console.warn('Impossible de charger l\'historique des messages:', historyErr);
                                }
            } catch (err) {
                console.error('Erreur chargement demande:', err);
            } finally {
                setLoadingRequest(false);
            }
        };
        fetchRequest();
    }, [requestId, currentUser]);

    // ── Connexion Socket.io ──
    useEffect(() => {
        if (!currentUser?.id || !requestId) return;

        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        // Rejoindre la room
        socket.on('connect', () => {
            socket.emit('join_room', {
                requestId,
                userId: currentUser.id,
                username: currentUser.username
            });
        });

        // Recevoir un message texte + traduction Muse dans ma langue
                socket.on('receive_message', (msg) => {
                    const normalized = {
                        id: msg.id || msg._id || Date.now(),
                        content: msg.content,
                        content_translated: msg.content_translated || msg.translated || null,
                        translated: msg.translated || msg.content_translated || null,
                        engine: msg.engine || null,
                        poweredBy: msg.poweredBy || null,
                        sourceLang: msg.sourceLang || null,
                        targetLang: msg.targetLang || null,
                        type: msg.type || 'text',
                        url: msg.url || msg.fileUrl || null,
                        isMe: false,
                        username: msg.username,
                        time: msg.time || formatTime(new Date(), lang)
                    };
                    setMessages(prev => [...prev, normalized]);
                });

                // Echo expediteur avec traduction pour toggle Voir original
                socket.on('message_sent', (msg) => {
                    setMessages(prev => prev.map(m =>
                        String(m.id) === String(msg.id) || (m.content === msg.content && m.isMe)
                            ? { ...m, content_translated: msg.content_translated || m.content_translated, targetLang: msg.targetLang, engine: msg.engine }
                            : m
                    ));
                });

        // Recevoir un fichier
        socket.on('receive_file', (file) => {
            setMessages(prev => [...prev, file]);
        });

        // ✅ Session terminée — côté mentor
        socket.on('session_ended', ({ message, newReputation }) => {
            setSessionEnded(true);
            // Redirection automatique après 3 secondes
            setTimeout(() => navigate('/home'), 3000);
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUser?.id, requestId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            await sendMessage({ requestId, content: input });

            const newMsg = {
                id: Date.now(),
                content: input,
                type: 'text',
                isMe: true,
                time: formatTime(new Date(), lang)
            };

            setMessages(prev => [...prev, newMsg]);

            // Envoyer via socket à l'autre utilisateur avec persistance
            socketRef.current?.emit('send_message', {
                requestId,
                content: input,
                username: currentUser?.username,
                userId: currentUser?.id,
                time: newMsg.time
            });

            setInput('');
            setBlocked(false);
        } catch (err) {
            const msg = err.response?.data?.message || '';
            if (msg.includes('interdites')) {
                setBlocked(true);
            } else {
                alert(msg || t('chat.sendErr'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formatsAutorises = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!formatsAutorises.includes(file.type)) {
            alert(t('chat.formatErr'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert(t('chat.sizeErr'));
            return;
        }

        const isImage = file.type.startsWith('image/');
        const url     = URL.createObjectURL(file);
        const time    = formatTime(new Date(), lang);

        const newMsg = {
            id: Date.now(),
            content: file.name,
            type: isImage ? 'image' : 'pdf',
            url,
            isMe: true,
            time
        };

        setMessages(prev => [...prev, newMsg]);

        // Envoyer via socket
        socketRef.current?.emit('send_file', {
            requestId,
            fileName: file.name,
            fileType: isImage ? 'image' : 'pdf',
            fileUrl: url,
            username: currentUser?.username,
            userId: currentUser?.id,
            time
        });

        e.target.value = '';
    };

    const handleComplete = async () => {
        if (rating === 0) return alert(t('chat.giveNote'));
        setCompleting(true);
        try {
            const res = await completeRequest({ requestId, rating });

            // ✅ Notifier le mentor via socket
            socketRef.current?.emit('session_completed', {
                requestId,
                newReputation: res.data.newSkillReputation
            });

            // ✅ Mettre à jour les XP de l'apprenant si nécessaire
            // (Le mentor reçoit les XP, pas l'apprenant)

            navigate('/home');
        } catch (err) {
            alert(err.response?.data?.message || t('chat.closeErr'));
        } finally {
            setCompleting(false);
        }
    };

    const handleReplaceMentor = async () => {
        if (!window.confirm(t('chat.confirmReplace'))) return;
        setReplacing(true);
        try {
            await replaceMentor({ requestId });
            navigate('/home');
        } catch (err) {
            alert(err.response?.data?.message || t('chat.replaceErr'));
        } finally {
            setReplacing(false);
        }
    };

    // ── Écran de chargement ──
    if (loadingRequest) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // ── Écran session terminée (côté mentor) ──
    if (sessionEnded) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-gray-800 rounded-2xl p-10 max-w-sm w-full text-center">
                    <p className="text-5xl mb-4">🎓</p>
                    <h2 className="text-white text-xl font-bold mb-2">{t('chat.sessionEnded')}</h2>
                    <p className="text-gray-400 text-sm mb-4">
                        {t('chat.sessionEndedSub')}
                    </p>
                    <p className="text-gray-500 text-xs">
                        {t('chat.redirecting')}
                    </p>
                    <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
                        <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-1 rounded-full animate-pulse w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">

            {/* HEADER */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/home')}
                        className="text-gray-400 hover:text-white transition mr-2 text-xl"
                    >
                        ←
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
                        🔒
                    </div>
                    <div>
                        <h1 className="text-white font-semibold text-sm">{t('chat.title')}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-gray-400 text-xs">{t('chat.subtitle')}</span>
                            {isApprenant && (
                                <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                    👤 {t('chat.learner')}
                                </span>
                            )}
                            {isMentor && (
                                                            <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded-full">
                                                                🎓 {t('chat.mentor')}
                                                            </span>
                                                        )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isApprenant && (
                        <>
                            <button
                                onClick={handleReplaceMentor}
                                disabled={replacing}
                                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-2 rounded-lg transition disabled:opacity-50"
                            >
                                🔄 {replacing ? t('chat.replacing') : t('chat.replace')}
                            </button>
                            <button
                                onClick={() => setShowRating(true)}
                                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                            >
                                ✅ {t('chat.closeRate')}
                            </button>
                        </>
                    )}
                    {isMentor && (
                        <span className="text-gray-400 text-xs italic px-3">
                            ⏳ {t('chat.waitingClose')}
                        </span>
                    )}
                </div>
            </div>

            {/* ZONE MESSAGES */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                <div className="flex justify-center">
                    <div className="bg-gray-800 text-gray-400 text-xs px-4 py-2 rounded-full">
                        🔒 {t('chat.privateOpened')}
                    </div>
                </div>

                {requestData && (
                    <div className="flex justify-center">
                        <div className="bg-gray-800/60 border border-gray-700 text-gray-300 text-xs px-4 py-2 rounded-xl max-w-md text-center">
                            <span className="font-semibold">{requestData.skillTag}</span> · {requestData.title}
                        </div>
                    </div>
                )}

                {messages.length === 0 && (
                    <div className="flex justify-center py-10">
                        <div className="text-center">
                            <p className="text-4xl mb-3">💬</p>
                            <p className="text-gray-500 text-sm">{t('chat.startConv')}</p>
                            <p className="text-gray-600 text-xs mt-1">{t('chat.canSend')}</p>
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                            {/* Nom de l'expéditeur (côté autre) */}
                            {!msg.isMe && msg.username && (
                                <p className="text-gray-500 text-xs mb-1 px-1">{msg.username}</p>
                            )}

                            {(!msg.type || msg.type === 'text') && (
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                                msg.isMe
                                                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-br-none'
                                                                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                                            }`}>
                                                                {(msg.content_translated || msg.translated) && !msg.isMe && !showOriginal[msg.id] ? (
                                                                    <>
                                                                        <p>{msg.content_translated || msg.translated}</p>
                                                                        <p className="text-[11px] opacity-70 mt-1 italic">{t('common.original')} : {msg.content}</p>
                                                                        {msg.engine && <p className="text-[10px] opacity-60 mt-0.5">{t('chat.via', { engine: msg.engine })}</p>}
                                                                        <button onClick={() => setShowOriginal(prev => ({ ...prev, [msg.id]: true }))} className="text-[11px] underline opacity-80 mt-1">{t('chat.seeOriginal')}</button>
                                                                    </>
                                                                ) : (msg.content_translated || msg.translated) && !msg.isMe && showOriginal[msg.id] ? (
                                                                    <>
                                                                        <p>{msg.content}</p>
                                                                        <button onClick={() => setShowOriginal(prev => ({ ...prev, [msg.id]: false }))} className="text-[11px] underline opacity-80 mt-1">{t('chat.seeTranslation')}</button>
                                                                    </>
                                                                ) : (
                                                                    <p>{msg.content}</p>
                                                                )}
                                                            </div>
                                                        )}

                            {msg.type === 'image' && (
                                <div className={`rounded-2xl overflow-hidden max-w-xs ${msg.isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                                    <img
                                                                            src={msg.url}
                                                                            alt={t('chat.sharedPhoto')}
                                        className="w-full object-cover cursor-pointer hover:opacity-90 transition"
                                        onClick={() => window.open(msg.url, '_blank')}
                                    />
                                </div>
                            )}

                            {msg.type === 'pdf' && (
                                <a
                                    href={msg.url}
                                    download={msg.content}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
                                        msg.isMe
                                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-br-none'
                                            : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                    }`}
                                >
                                    <span className="text-2xl">📄</span>
                                    <div>
                                        <p className="text-sm font-semibold truncate max-w-[160px]">{msg.content}</p>
                                        <p className="text-xs opacity-70">{t('chat.clickDownload')}</p>
                                    </div>
                                </a>
                            )}

                            <p className="text-gray-600 text-xs mt-1 px-1">{msg.time}</p>
                        </div>
                    </div>
                ))}

                {blocked && (
                    <div className="flex justify-center">
                        <div className="bg-red-900/40 border border-red-700 text-red-300 text-xs px-4 py-2 rounded-xl max-w-sm text-center">
                            ⚠️ {t('chat.blockedMsg')}
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ZONE SAISIE */}
            <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
                <div className="flex items-end gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,image/jpeg,image/png"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition"
                        title={t('chat.attachTitle')}
                    >
                        📎
                    </button>

                    <div className="flex-1 bg-gray-700 rounded-xl px-4 py-2.5">
                        <textarea
                            value={input}
                            onChange={(e) => { setInput(e.target.value); setBlocked(false); }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={t('chat.placeholder')}
                            rows={1}
                            maxLength={500}
                            className="w-full bg-transparent text-gray-100 text-sm focus:outline-none resize-none placeholder-gray-500"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl disabled:opacity-40 transition"
                    >
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            : '➤'
                        }
                    </button>
                </div>
                <p className="text-gray-600 text-xs mt-2 text-center">
                    📎 {t('chat.acceptedFormats')}
                </p>
            </div>

            {/* MODAL NOTATION — uniquement pour l'apprenant */}
            {showRating && isApprenant && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <p className="text-4xl mb-2">🎓</p>
                            <h2 className="text-xl font-bold text-gray-800">{t('chat.rateMentor')}</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {t('chat.rateHint')}
                            </p>
                        </div>

                        <div className="flex justify-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className={`text-5xl transition-transform hover:scale-110 ${
                                        star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <p className="text-center text-sm text-gray-500 mb-6 h-5">
                                                    {(hoverRating || rating) === 1 && t('chat.rate1')}
                                                    {(hoverRating || rating) === 2 && t('chat.rate2')}
                                                    {(hoverRating || rating) === 3 && t('chat.rate3')}
                                                    {(hoverRating || rating) === 4 && t('chat.rate4')}
                                                    {(hoverRating || rating) === 5 && t('chat.rate5')}
                                                </p>

                                                <div className="bg-blue-50 rounded-xl p-3 mb-5 text-xs text-blue-700">
                                                    <p className="font-semibold mb-1">{t('chat.repTitle')}</p>
                                                    <p>🎯 {t('chat.rep1')}</p>
                                                    <p>💪 {t('chat.rep2')}</p>
                                                    <p>🤝 {t('chat.rep3')}</p>
                                                </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRating(false)}
                                                                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
                                                            >
                                                                {t('chat.cancel')}
                                                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={completing || rating === 0}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition"
                            >
                                {completing ? (
                                                                    <span className="flex items-center justify-center gap-2">
                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                        {t('chat.sending')}
                                                                    </span>
                                                                ) : `${t('chat.validate')} ✅`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}