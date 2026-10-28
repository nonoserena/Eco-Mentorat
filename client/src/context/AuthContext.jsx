import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/index.js';
import { login as loginAPI, register as registerAPI } from '../services/api';

const syncLang = (lang) => {
    const l = String(lang || 'fr').toLowerCase().slice(0, 5);
    const supported = ['fr', 'en', 'ja', 'ar', 'pt', 'es', 'wo', 'zh'];
    const finalLang = supported.includes(l) ? l : 'fr';
    try {
        localStorage.setItem('eco-lang', finalLang);
        if (i18n.language !== finalLang) i18n.changeLanguage(finalLang);
        document.documentElement.lang = finalLang;
        document.documentElement.dir = finalLang === 'ar' ? 'rtl' : 'ltr';
    } catch {}
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token    = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
                    try {
                        const parsed = JSON.parse(userData);
                        setUser(parsed);
                        syncLang(parsed.preferredLang || localStorage.getItem('eco-lang') || 'fr');
                    } catch {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } else {
                    syncLang(localStorage.getItem('eco-lang') || 'fr');
                }
                setLoading(false);
    }, []);

    const login = async (email, password) => {
            const res = await loginAPI({ email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            syncLang(res.data.user?.preferredLang || 'fr');
            return res.data;
        };

        const register = async (formData) => {
            const res = await registerAPI(formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            syncLang(res.data.user?.preferredLang || formData.preferredLang || 'fr');
            return res.data;
        };

        // FIX: met à jour le user dans le state ET le localStorage après une action
        const updateUser = (updatedFields) => {
            const newUser = { ...user, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            if (updatedFields?.preferredLang) syncLang(updatedFields.preferredLang);
        };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
};