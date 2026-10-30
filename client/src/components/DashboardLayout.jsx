import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { formatNumber, formatTime, getLocale } from '../utils/format';


const getSocketURL = () => { if (typeof window !== 'undefined' && (window.location.port === '8082' || window.location.port === '80')) return window.location.origin; return 'http://localhost:5000'; };
const SOCKET_URL = getSocketURL();

const NAV_KEYS = [
    { path: '/home', icon: '🏠', key: 'nav.home' },
    { path: '/create-request', icon: '✋', key: 'nav.create' },
    { path: '/leaderboard', icon: '🏆', key: 'nav.leaderboard' },
    { path: '/history', icon: '📜', key: 'nav.history' },
    { path: '/profile', icon: '👤', key: 'nav.profile' },
];

export default function DashboardLayout({ children }) {
    const { t, i18n } = useTranslation();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout, updateUser } = useAuth();
    const lang = user?.preferredLang || i18n.language || 'fr';
    const location                     = useLocation();
    const navigate                     = useNavigate();
    const socketRef                    = useRef(null);

    const [searchQuery, setSearchQuery]       = useState('');
    const [notifications, setNotifications]   = useState([]);
    const [showNotifs, setShowNotifs]         = useState(false);
    const [unreadCount, setUnreadCount]       = useState(0);

    const isActive = (path) => location.pathname === path;

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/create-request?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const getRankColor = (rank) => {
        const colors = {
            'Novice':   'bg-gray-100 text-gray-600',
            'Apprenti': 'bg-blue-100 text-blue-700',
            'Confirmé': 'bg-green-100 text-green-700',
            'Expert':   'bg-orange-100 text-orange-700',
            'Légende':  'bg-purple-100 text-purple-700',
        };
        return colors[rank] || 'bg-gray-100 text-gray-600';
    };
    

    // Connexion Socket.io globale + notifications
   useEffect(() => {
    if (!user?.id) return;

    const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // FIX: fallback sur polling
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });
    socketRef.current = socket;

    // FIX: enregistrer immÃ©diatement ET sur reconnexion
    const registerUser = () => {
        console.log('[SOCKET] Enregistrement user:', user.id);
        socket.emit('register_user', { userId: user.id });
    };

    socket.on('connect', () => {
        console.log('[SOCKET] ConnectÃ©:', socket.id);
        registerUser();
    });

    // FIX: re-enregistrer aprÃ¨s reconnexion
    socket.on('reconnect', () => {
        console.log('[SOCKET] ReconnectÃ©');
        registerUser();
    });

    // Recevoir notification nouvelle demande + feed temps rÃ©el sans refresh
        socket.on('new_request', (data) => {
            console.log('[SOCKET] Notification reÃ§ue:', data);
            const myLang = (user?.preferredLang || i18n.language || 'fr').slice(0,2);
            const newNotif = {
                id:        Date.now(),
                message:   data.message,
                skillTag:  data.skillTag,
                requestId: data.id,
                title:     data.title,
                time:      formatTime(new Date(), myLang),
                read: false
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
        });
        socket.on('feed_new_request', () => {
            try { window.dispatchEvent(new CustomEvent('eco-feed-refresh')); } catch {}
        });
        socket.on('feed_updated', () => {
            try { window.dispatchEvent(new CustomEvent('eco-feed-refresh')); } catch {}
        });

    // RafraÃ®chir profil toutes les 30 secondes
    const refreshProfile = async () => {
        try {
            const res = await getMyProfile();
            updateUser(res.data.user);
        } catch {
            // silencieux
        }
    };
    const profileInterval = setInterval(refreshProfile, 30000);

    return () => {
        socket.disconnect();
        clearInterval(profileInterval);
    };
}, [user?.id]);

    const handleNotifClick = (notif) => {
        // Marquer comme lu
        setNotifications(prev =>
            prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        setShowNotifs(false);
        navigate('/home');
    };

    const clearNotifs = () => {
        setNotifications([]);
        setUnreadCount(0);
        setShowNotifs(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* SIDEBAR */}
            <aside className="w-64 min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col fixed left-0 top-0 z-40 shadow-xl">
                <div className="px-6 py-6 border-b border-blue-800">
                    <h1 className="text-xl font-bold text-white">Eco-Mentorat</h1>
                    <p className="text-blue-300 text-xs mt-0.5">{t('dashboard.tagline')}</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                                    {NAV_KEYS.map(item => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                isActive(item.path)
                                                    ? 'bg-white text-blue-900 shadow-md'
                                                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            {t(item.key)}
                                        </Link>
                                    ))}
                                </nav>

                <div className="px-4 py-4 border-t border-blue-800">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-800/50">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRankColor(user?.rankTitle)}`}>
                                {user?.rankTitle || 'Novice'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 px-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-blue-300 text-xs">{t('profile.totalXp')}</span>
                            <span className="text-white text-xs font-bold">⚡ {formatNumber(user?.xpPoints ?? 0, lang)}</span>
                        </div>
                        <div className="w-full bg-blue-800 rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-violet-400 to-blue-400 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((user?.xpPoints ?? 0) % 200) / 2)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* CONTENU PRINCIPAL */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">

                {/* HEADER */}
                <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
                    <div className="flex-1 max-w-lg relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder={t('common.search')}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>
                    <button
                                         onClick={toggleTheme}
                                         className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                                          title={isDark ? 'Mode clair' : 'Mode sombre'}
                                        >
                                            {isDark ? '☀️' : '🌙'}
                                        </button>
                                        <LanguageSwitcher compact />
                                        <div className="flex items-center gap-3 ml-auto">

                        {/* Cloche notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                className="relative w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                            >
                                <span className="text-lg">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown notifications */}
                            {showNotifs && (
                                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-800 text-sm">{t('dashboard.notifications')}</h3>
                                                                                {notifications.length > 0 && (
                                                                                    <button
                                                                                        onClick={clearNotifs}
                                                                                        className="text-xs text-gray-400 hover:text-gray-600"
                                                                                    >
                                                                                        {t('dashboard.clearAll')}
                                                                                    </button>
                                                                                )}
                                    </div>

                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center text-gray-400 text-sm">
                                                                                    <p className="text-2xl mb-2">🔕</p>
                                                                                    <p>{t('dashboard.noNotif')}</p>
                                                                                </div>
                                    ) : (
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.map(notif => (
                                                <button
                                                    key={notif.id}
                                                    onClick={() => handleNotifClick(notif)}
                                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                                                        !notif.read ? 'bg-blue-50/50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-lg mt-0.5">ðŸ””</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                        </div>
                                                        {!notif.read && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-gray-200"></div>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user?.username}
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition"
                        >
                            <span>â»</span>
                            <span className="hidden sm:block">{t('nav.logout')}</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}