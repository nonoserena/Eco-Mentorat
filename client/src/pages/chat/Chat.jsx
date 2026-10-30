import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { sendMessage, getChatHistory, completeRequest, getRequestById, replaceMentor } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/format';
import ThemeToggle from '../../components/ThemeToggle';
import Icon from '../../components/Icon';

const getSocketURL = () => {
  if (typeof window !== 'undefined' && (window.location.port === '8082' || window.location.port === '80')) {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};
const SOCKET_URL = getSocketURL();

export default function Chat() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = (currentUser?.preferredLang || i18n.language || 'fr').slice(0, 2);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  const [requestData, setRequestData] = useState(null);
  const [isApprenant, setIsApprenant] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Clôture et évaluation
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [completing, setCompleting] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionEndData, setSessionEndData] = useState(null);

  // Bascule original / traduction par ID de message
  const [showOriginal, setShowOriginal] = useState({});

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await getRequestById(requestId);
        const req = res.data.request;
        setRequestData(req);

        const myId = currentUser?.id?.toString();
        setIsApprenant(req.requesterId?.toString() === myId);
        setIsMentor(req.mentorId?.toString() === myId);

        // Historique persistant
        try {
          const histRes = await getChatHistory(requestId);
          if (histRes.data?.messages) {
            const myLang = currentUser?.preferredLang || 'fr';
            const mapped = histRes.data.messages.map((m) => {
              let tr = m.content_translated || m.translated || null;
              if (!tr && m.translations) {
                tr = m.translations[myLang] || m.translations?.ja || m.translations?.fr || null;
              }
              const isSenderApprenant = m.senderId?.toString() === req.requesterId?.toString();
              return {
                id: m._id,
                content: m.content,
                content_translated: tr,
                engine: m.engine || null,
                sourceLang: m.sourceLang || null,
                type: m.type || 'text',
                url: m.fileUrl,
                fileName: m.fileName,
                isMe: m.senderId?.toString() === myId,
                username: m.senderUsername,
                role: isSenderApprenant ? 'apprenant' : 'mentor',
                time: formatTime(m.createdAt, lang),
              };
            });
            setMessages(mapped);
          }
        } catch (e) {
          console.warn('Historique indisponible:', e);
        }
      } catch (err) {
        navigate('/home');
      } finally {
        setLoadingRequest(false);
      }
    };

    fetchRequest();
  }, [requestId, currentUser?.id, lang, navigate]);

  // Connexion Socket.io
  useEffect(() => {
    if (!currentUser?.id || !requestId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register_user', { userId: currentUser.id });
      socket.emit('join_room', { requestId, userId: currentUser.id, username: currentUser.username });
    });

    socket.on('receive_message', (msg) => {
      const isSenderApprenant = msg.userId?.toString() === requestData?.requesterId?.toString();
      const myLang = (currentUser?.preferredLang || 'fr').slice(0, 2);
      let translatedText = msg.content_translated;
      if (!translatedText && msg.translations) {
        translatedText = msg.translations[myLang] || msg.translations?.fr || null;
      }

      setMessages((prev) => {
        // Évite les doublons si le message a déjà été ajouté
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;

        return [
          ...prev,
          {
            id: msg.id || Date.now(),
            content: msg.content,
            content_translated: translatedText,
            engine: msg.engine || null,
            sourceLang: msg.sourceLang || null,
            type: msg.type || 'text',
            url: msg.url,
            fileName: msg.fileName,
            isMe: msg.userId?.toString() === currentUser.id?.toString(),
            username: msg.username,
            role: isSenderApprenant ? 'apprenant' : 'mentor',
            time: msg.time || formatTime(new Date(), lang),
          },
        ];
      });
    });

    // Confirmation d'envoi pour l'émetteur (mise à jour avec ID serveur et traduction)
    socket.on('message_sent', (msg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.isMe && (m.id === msg.id || m.content === msg.content)
            ? {
                ...m,
                id: msg.id || m.id,
                content_translated: msg.content_translated || m.content_translated,
                engine: msg.engine || m.engine,
                sourceLang: msg.sourceLang || m.sourceLang,
              }
            : m
        )
      );
    });

    socket.on('receive_file', (fileMsg) => {
      const isSenderApprenant = fileMsg.userId?.toString() === requestData?.requesterId?.toString();
      setMessages((prev) => {
        if (fileMsg.id && prev.some((m) => m.id === fileMsg.id)) return prev;
        return [
          ...prev,
          {
            id: fileMsg.id || Date.now(),
            type: 'file',
            url: fileMsg.url,
            fileName: fileMsg.fileName,
            isMe: fileMsg.userId?.toString() === currentUser.id?.toString(),
            username: fileMsg.username,
            role: isSenderApprenant ? 'apprenant' : 'mentor',
            time: fileMsg.time || formatTime(new Date(), lang),
          },
        ];
      });
    });

    socket.on('file_sent', (fileMsg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.isMe && (m.fileName === fileMsg.fileName || m.url === fileMsg.url)
            ? { ...m, id: fileMsg.id || m.id }
            : m
        )
      );
    });

    // Clôture automatique et redirection différenciée pour le mentor et l'apprenant
    const onSessionEnded = (data) => {
      const endPayload = data || {};
      setSessionEndData(endPayload);
      setSessionEnded(true);
      setShowRating(false);

      const isUserMentor =
        currentUser?.id?.toString() === requestData?.mentorId?.toString() ||
        currentUser?.id?.toString() === endPayload.mentorId?.toString();

      if (isUserMentor) {
        // Le mentor voit sa récompense XP et est redirigé vers son profil pour voir sa progression
        setTimeout(() => {
          navigate('/profile');
        }, 3500);
      } else {
        // L'apprenant est redirigé vers l'historique
        setTimeout(() => {
          navigate('/history');
        }, 3500);
      }
    };

    socket.on('session_ended', onSessionEnded);
    socket.on('session_completed', onSessionEnded);

    return () => {
      socket.disconnect();
    };
  }, [requestId, currentUser?.id, currentUser?.username, currentUser?.preferredLang, requestData?.requesterId, requestData?.mentorId, lang, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const content = input.trim();
    setInput('');
    setLoading(true);

    const tempId = `temp-${Date.now()}`;
    const sentTime = formatTime(new Date(), lang);
    const isSenderApprenant = currentUser.id?.toString() === requestData?.requesterId?.toString();

    // 1. Affichage optimiste instantané chez l'émetteur
    const optimisticMsg = {
      id: tempId,
      content,
      content_translated: null,
      type: 'text',
      isMe: true,
      username: currentUser.username,
      userId: currentUser.id,
      role: isSenderApprenant ? 'apprenant' : 'mentor',
      time: sentTime,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      socketRef.current?.emit('send_message', {
        requestId,
        content,
        username: currentUser.username,
        userId: currentUser.id,
        time: sentTime,
        sourceLang: (currentUser?.preferredLang || 'fr').slice(0, 2),
      });
    } catch {
      alert(t('chat.sendErr'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t('chat.sizeErr'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const tempId = `file-${Date.now()}`;
      const sentTime = formatTime(new Date(), lang);
      const isSenderApprenant = currentUser.id?.toString() === requestData?.requesterId?.toString();

      // Affichage optimiste instantané du fichier
      const optimisticFile = {
        id: tempId,
        type: 'file',
        url: reader.result,
        fileName: file.name,
        isMe: true,
        username: currentUser.username,
        userId: currentUser.id,
        role: isSenderApprenant ? 'apprenant' : 'mentor',
        time: sentTime,
      };
      setMessages((prev) => [...prev, optimisticFile]);

      socketRef.current?.emit('send_file', {
        requestId,
        url: reader.result,
        fileName: file.name,
        fileType: file.type,
        username: currentUser.username,
        userId: currentUser.id,
        time: sentTime,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await completeRequest({ requestId, rating });
      const { xpGained, newSkillReputation, mentorId, newXpPoints, newRankTitle } = res.data || {};

      const endPayload = {
        requestId,
        rating,
        xpGained: xpGained || (50 + rating * 10),
        newSkillReputation,
        mentorId: mentorId || requestData?.mentorId,
        newXpPoints,
        newRankTitle,
      };

      // Émission socket pour synchroniser instantanément les deux participants
      socketRef.current?.emit('session_completed', endPayload);
      setSessionEndData(endPayload);
      setSessionEnded(true);
      setShowRating(false);

      // Redirection apprenant vers l'historique
      setTimeout(() => navigate('/history'), 3500);
    } catch {
      alert(t('chat.closeErr'));
    } finally {
      setCompleting(false);
    }
  };

  const handleReplace = async () => {
    if (!window.confirm(t('chat.confirmReplace'))) return;
    setReplacing(true);
    try {
      await replaceMentor({ requestId });
      navigate('/home');
    } catch {
      alert(t('chat.replaceErr'));
    } finally {
      setReplacing(false);
    }
  };

  if (loadingRequest) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="spinner" style={{ width: 32, height: 32, color: 'var(--primary)' }} />
      </div>
    );
  }

  const activeIsMentor =
    currentUser?.id?.toString() === requestData?.mentorId?.toString() ||
    currentUser?.id?.toString() === sessionEndData?.mentorId?.toString();

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* ── HEADER ── */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button
              onClick={() => navigate('/home')}
              className="dash-icon-btn"
              title="Retour aux demandes"
            >
              <Icon name="chevron-left" size={18} />
            </button>

            <div className="chat-title-group">
              <h1 className="chat-title">{requestData?.title}</h1>
              <div className="chat-sub">
                <span className="badge badge-blue" style={{ fontSize: '10px', padding: '1px 6px', marginInlineEnd: '6px' }}>
                  {requestData?.skillTag}
                </span>
                <span>•</span>
                <span style={{ marginInlineStart: '6px' }}>
                  {isApprenant
                    ? requestData?.mentorId
                      ? 'Mentor assigné'
                      : 'En attente de mentor'
                    : 'Apprenant en ligne'}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            {isApprenant && requestData?.status === 'in-progress' && !sessionEnded && (
              <>
                <button
                  onClick={() => setShowRating(true)}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  <Icon name="check" size={14} />
                  <span>{t('chat.closeRate')}</span>
                </button>

                <button
                  onClick={handleReplace}
                  disabled={replacing}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  title="Remplacer le mentor"
                >
                  <span>{replacing ? t('chat.replacing') : t('chat.replace')}</span>
                </button>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div className="chat-messages">
          {sessionEnded && (
            <div
              style={{
                padding: '16px 20px',
                background: activeIsMentor ? 'var(--green-light)' : 'var(--blue-light)',
                border: `1px solid ${activeIsMentor ? 'var(--green)' : 'var(--blue)'}`,
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: activeIsMentor ? 'var(--green)' : 'var(--blue)',
                  marginBottom: '6px',
                }}
              >
                <Icon name={activeIsMentor ? 'award' : 'check-circle'} size={18} />
                <span>{t('chat.sessionEnded')}</span>
              </div>

              {activeIsMentor ? (
                <>
                  <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
                    L'apprenant a validé la session et vous a attribué <strong>{sessionEndData?.rating || 5} étoiles</strong>.
                  </p>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 14px',
                      borderRadius: '20px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      marginBottom: '8px',
                    }}
                  >
                    <Icon name="trophy" size={14} />
                    <span>+{sessionEndData?.xpGained || 100} XP gagnés</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Redirection vers votre profil pour observer votre progression...
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {t('chat.sessionEndedSub')} {t('chat.redirecting')}
                </p>
              )}
            </div>
          )}

          {messages.length === 0 && (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              {t('chat.startConv')}
            </div>
          )}

          {messages.map((msg) => {
            const hasTranslation = Boolean(msg.content_translated && msg.content_translated !== msg.content);
            const isShowingOriginal = Boolean(showOriginal[msg.id]);
            const displayContent = hasTranslation && !isShowingOriginal ? msg.content_translated : msg.content;

            return (
              <div key={msg.id} className={`chat-msg-wrap ${msg.isMe ? 'is-me' : 'is-other'}`}>
                <div className="chat-msg-header">
                  <span className="chat-msg-sender">{msg.username}</span>
                  <span className={`role-badge ${msg.role === 'mentor' ? 'is-mentor' : 'is-apprenant'}`}>
                    {msg.role === 'mentor' ? t('chat.mentor') : t('chat.learner')}
                  </span>
                </div>

                <div className="chat-bubble">
                  {msg.type === 'file' ? (
                    <a
                      href={msg.url}
                      download={msg.fileName || 'fichier'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none' }}
                    >
                      <Icon name="file-text" size={18} />
                      <span style={{ textDecoration: 'underline' }}>{msg.fileName || t('chat.clickDownload')}</span>
                    </a>
                  ) : (
                    <>
                      <div>{displayContent}</div>
                      {hasTranslation && (
                        <button
                          type="button"
                          className="chat-tr-btn"
                          onClick={() => setShowOriginal((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        >
                          <Icon name="globe" size={12} />
                          <span>
                            {isShowingOriginal ? t('chat.seeTranslation') : t('chat.seeOriginal')}
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="chat-msg-time">
                  {msg.time}
                  {hasTranslation && !isShowingOriginal && (
                    <span style={{ marginInlineStart: 6, opacity: 0.8 }}>
                      • {t('common.translatedVia', {
                          from: (msg.sourceLang || 'auto').toUpperCase(),
                          to: (lang || 'fr').toUpperCase(),
                          engine: msg.engine || 'Muse Spark'
                        })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* ── COMPOSER ── */}
        <form onSubmit={handleSend} className="chat-composer">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".pdf,.png,.jpg,.jpeg,.txt,.c,.java,.py"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="dash-icon-btn"
            title={t('chat.canSend')}
            disabled={sessionEnded}
          >
            <Icon name="paperclip" size={16} />
          </button>

          <input
            type="text"
            className="chat-input-box"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sessionEnded ? t('chat.sessionEnded') : t('chat.placeholder')}
            disabled={sessionEnded || loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || sessionEnded || loading}
            style={{ padding: '9px 16px' }}
          >
            <Icon name="send" size={16} />
          </button>
        </form>

        {/* ── MODAL DE NOTATION ÉTUDIANT ── */}
        {showRating && (
          <div className="chat-modal-overlay">
            <div className="chat-modal-card">
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--heading)', marginBottom: '6px' }}>
                {t('chat.rateMentor')}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                {t('chat.rateHint')}
              </p>

              {/* Sélection des étoiles sobres (SVG) */}
              <div className="chat-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`chat-star-btn ${star <= rating ? 'is-active' : ''}`}
                    title={`${star} / 5`}
                  >
                    <Icon name="star" size={26} strokeWidth={1.5} />
                  </button>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '20px' }}>
                {rating === 1 && t('chat.rate1')}
                {rating === 2 && t('chat.rate2')}
                {rating === 3 && t('chat.rate3')}
                {rating === 4 && t('chat.rate4')}
                {rating === 5 && t('chat.rate5')}
              </div>

              {/* Formule de réputation certifiée */}
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: 'var(--muted)', marginBottom: '20px' }}>
                <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                  {t('chat.repTitle')}
                </div>
                <div>• {t('chat.rep1')}</div>
                <div>• {t('chat.rep2')}</div>
                <div>• {t('chat.rep3')}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRating(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  disabled={completing}
                >
                  {t('chat.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={completing}
                >
                  {completing ? t('chat.sending') : t('chat.validate')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
