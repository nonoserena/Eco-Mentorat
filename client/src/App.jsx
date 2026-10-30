import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Landing       from './pages/Landing';
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import Home          from './pages/dashboard/Home';
import CreateRequest from './pages/dashboard/CreateRequest';
import Leaderboard   from './pages/dashboard/LeaderBoard';
import History       from './pages/dashboard/History';
import Profile       from './pages/profile/Profile';
import PublicProfile from './pages/profile/PublicProfile';
import Chat          from './pages/chat/Chat';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return !user ? children : <Navigate to="/home" replace />;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Landing page */}
            <Route path="/"         element={<Landing />} />

            {/* Profil public vérifié pour recruteurs et CV */}
            <Route path="/u/:username" element={<PublicProfile />} />

            {/* Routes publiques */}
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Routes protégées */}
            <Route path="/home"            element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/create-request"  element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
            <Route path="/leaderboard"     element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/history"         element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/chat/:requestId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
                        <AppRoutes />
                    </div>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}