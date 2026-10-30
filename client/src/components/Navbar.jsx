import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path
            ? 'text-blue-900 font-semibold border-b-2 border-blue-900'
            : 'text-gray-500 hover:text-blue-900 transition';

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/home" className="text-xl font-bold text-blue-900">
                    Eco-Mentorat
                </Link>

                {/* Liens */}
                <div className="flex items-center gap-6 text-sm">
                    <Link to="/home" className={isActive('/home')}>Accueil</Link>
                    <Link to="/create-request" className={isActive('/create-request')}>Demander de l'aide</Link>
                    <Link to="/leaderboard" className={isActive('/leaderboard')}>Classement</Link>
                    <Link to="/profile" className={isActive('/profile')}>Mon Profil</Link>
                </div>

                {/* User + Logout */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium inline-flex items-center gap-1.5">
                        <Icon name="user" size={14} />
                        {user?.username}
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
}
