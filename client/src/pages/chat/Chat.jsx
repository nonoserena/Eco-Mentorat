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

      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || Date.now(),
          content: msg.content,
          content_translated: translatedText,
          engine: msg.engine || null,
          type: msg.type || 'text',
          url: msg.url,
          fileName: msg.fileName,
          isMe: msg.userId?.toString() === currentUser.id?.toString(),
          username: msg.username,
          role: isSenderApprenant ? 'apprenant' : 'mentor',
          time: msg.time || formatTime(new Date(), lang),
        },
      ]);
    });

    socket.on('receive_file', (fileMsg) => {
      const isSenderApprenant = fileMsg.userId?.toString() === requestData?.requesterId?.toString();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'file',
          url: fileMsg.url,
          fileName: fileMsg.fileName,
          isMe: fileMsg.userId?.toString() === currentUser.id?.toString(),
          username: fileMsg.username,
          role: isSenderApprenant ? 'apprenant' : 'mentor',
          time: fileMsg.time || formatTime(new Date(), lang),
        },
      ]);
    });

    socket.on('session_completed', () => {
      setSessionEnded(true);
      setTimeout(() => navigate('/home'), 3500);
    });

    return () => {
      socket.disconnect();
    };
  }, [requestId, currentUser?.id, currentUser?.username, currentUser?.preferredLang, requestData?.requesterId, lang, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const content = input.trim();
    setInput('');
    setLoading(true);

    try {
      socketRef.current?.emit('send_message', {
        requestId,
        content,
        username: currentUser.username,
        userId: currentUser.id,
        time: formatTime(new Date(), lang),
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
      socketRef.current?.emit('send_file', {
        requestId,
        url: reader.result,
        fileName: file.name,
        username: currentUser.username,
        userId: currentUser.id,
        time: formatTime(new Date(), lang),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeRequest({ requestId, rating });
      socketRef.current?.emit('session_completed', { requestId });
      setShowRating(false);
      navigate('/home');
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
        <span className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">

        {/* ── HEADER ── */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button onClick={() => navigate('/home')} className="dash-icon-btn" title={t('common.back')}>
              <Icon name="chevron-left" size={16} />
            </button>
            <div className="chat-title-group">
              <div className="chat-title">{requestData?.title || t('chat.title')}</div>
              <div className="chat-sub">
                <span className="badge badge-blue" style={{ fontSize: 10, padding: '1px 6px' }}>
                  {requestData?.skillTag || '#entraide'}
                </span>
                <span style={{ margin: '0 6px', opacity: 0.5 }}>•</span>
                <span>
                  {isApprenant ? `${t('chat.mentor')} assigné` : `${t('chat.learner')} en ligne`}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            {isApprenant && (
              <>
                <button
                  onClick={() => setShowRating(true)}
                  className="btn btn-primary"
                  style={{ padding: '7px 12px', fontSize: 12 }}
                >
                  <Icon name="check" size={14} />
                  <span>{t('chat.closeRate')}</span>
                </button>
                <button
                  onClick={handleReplace}
                  disabled={replacing}
                  className="btn btn-secondary"
                  style={{ padding: '7px 12px', fontSize: 12 }}
                >
                  <span>{t('chat.replace')}</span>
                </button>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div className="chat-messages">
          {sessionEnded && (
            <div style={{ padding: '12px 16px', background: 'var(--green-light)', color: 'var(--green)', borderRadius: 6, fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
              {t('chat.sessionEnded')} {t('chat.redirecting')}
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
                      • {t('common.translatedVia', { engine: msg.engine || 'Muse' })}
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
          >
            <Icon name="paperclip" size={16} />
          </button>

          <input
            type="text"
            className="chat-input-box"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            disabled={sessionEnded}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || loading || sessionEnded}
            style={{ padding: '9px 16px' }}
          >
            <Icon name="send" size={14} />
            <span>{t('common.send')}</span>
          </button>
        </form>

      </div>

      {/* ── MODALE DE NOTATION & CLÔTURE ── */}
      {showRating && (
        <div className="chat-modal-overlay">
          <div className="chat-modal-card">
            <h3 className="form-title" style={{ fontSize: 18 }}>{t('chat.closeRate')}</h3>
            <p className="form-sub" style={{ fontSize: 13, marginBottom: 16 }}>{t('chat.rateHint')}</p>

            <div className="chat-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`chat-star-btn ${star <= rating ? 'is-active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  <Icon name="star" size={28} />
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                {completing ? t('chat.sending') : t('chat.validate')}
              </button>
              <button
                onClick={() => setShowRating(false)}
                className="btn btn-secondary"
                style={{ padding: '10px 16px' }}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
