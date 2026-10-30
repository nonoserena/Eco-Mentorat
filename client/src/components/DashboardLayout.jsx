import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';
import { formatNumber, formatTime } from '../utils/format';

const getSocketURL = () => {
  if (typeof window !== 'undefined' && (window.location.port === '8082' || window.location.port === '80')) {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};
const SOCKET_URL = getSocketURL();

const NAV_ITEMS = [
  { path: '/home', icon: 'home', key: 'nav.home' },
  { path: '/create-request', icon: 'help-circle', key: 'nav.create' },
  { path: '/leaderboard', icon: 'trophy', key: 'nav.leaderboard' },
  { path: '/history', icon: 'clock', key: 'nav.history' },
  { path: '/profile', icon: 'user', key: 'nav.profile' },
];

export default function DashboardLayout({ children }) {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const lang = user?.preferredLang || i18n.language || 'fr';
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/create-request?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    const registerUser = () => {
      socket.emit('register_user', { userId: user.id });
    };

    socket.on('connect', registerUser);
    socket.on('reconnect', registerUser);

    socket.on('new_request', (data) => {
      const myLang = (user?.preferredLang || i18n.language || 'fr').slice(0, 2);
      const newNotif = {
        id: Date.now(),
        message: data.message,
        skillTag: data.skillTag,
        requestId: data.id,
        title: data.title,
        time: formatTime(new Date(), myLang),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('feed_new_request', () => {
      try { window.dispatchEvent(new CustomEvent('eco-feed-refresh')); } catch {}
    });
    socket.on('feed_updated', () => {
      try { window.dispatchEvent(new CustomEvent('eco-feed-refresh')); } catch {}
    });

    const refreshProfile = async () => {
      try {
        const res = await getMyProfile();
        updateUser(res.data.user);
      } catch {}
    };
    const profileInterval = setInterval(refreshProfile, 30000);

    return () => {
      socket.disconnect();
      clearInterval(profileInterval);
    };
  }, [user?.id]);

  const handleNotifClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setShowNotifs(false);
    navigate('/home');
  };

  const clearNotifs = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifs(false);
  };

  return (
    <div className="dash-layout">
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-header">
          <Link to="/home" className="dash-logo">
            Eco<span>-Mentorat</span>
          </Link>
        </div>

        <nav className="dash-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`dash-nav-item ${isActive(item.path) ? 'is-active' : ''}`}
            >
              <Icon name={item.icon} size={18} />
              <span>{t(item.key)}</span>
            </Link>
          ))}
        </nav>

        {/* Profil utilisateur bas de sidebar */}
        <div className="dash-sidebar-user">
          <div className="dash-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="dash-user-info">
            <div className="dash-user-name">{user?.username}</div>
            <div className="dash-user-grade">
              {user?.rankTitle || 'Novice'} • {formatNumber(user?.xpPoints ?? 0, lang)} XP
            </div>
          </div>
          <button
            onClick={logout}
            className="dash-icon-btn"
            style={{ border: 'none', color: 'rgba(255,255,255,0.6)' }}
            title={t('nav.logout')}
          >
            <Icon name="log-out" size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        {/* Topbar */}
        <header className="dash-header">
          <div className="dash-search-box">
            <Icon name="search" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={t('common.search')}
            />
          </div>

          <div className="dash-top-actions">
            <LanguageSwitcher compact />
            <ThemeToggle />

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="dash-icon-btn"
                title={t('dashboard.notifications')}
                style={{ position: 'relative' }}
              >
                <Icon name="bell" size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: 'var(--error)', color: '#fff', fontSize: 10,
                    fontWeight: 700, padding: '1px 5px', borderRadius: 10,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Menu déroulant notifications */}
              {showNotifs && (
                <div style={{
                  position: 'absolute', right: 0, top: 44, width: 320,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50, overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--heading)' }}>
                      {t('dashboard.notifications')}
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifs}
                        className="link-btn"
                        style={{ fontSize: 11 }}
                      >
                        {t('dashboard.clearAll')}
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                      {t('dashboard.noNotif')}
                    </div>
                  ) : (
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          style={{
                            padding: '12px 16px', borderBottom: '1px solid var(--border)',
                            cursor: 'pointer', background: notif.read ? 'transparent' : 'var(--blue-light)',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                            {notif.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page body */}
        <div className="dash-content">
          {children}
        </div>
      </main>
    </div>
  );
}
