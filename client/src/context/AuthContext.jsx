import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/index.js';
import { login as loginAPI, register as registerAPI, updateMyLang } from '../services/api';

const syncLang = (lang) => {
    const l = String(lang || 'fr').toLowerCase().slice(0, 2);
    const supported = ['fr', 'en', 'ja', 'ar', 'pt', 'es', 'wo', 'zh'];
    const finalLang = supported.includes(l) ? l : 'fr';
    try {
        localStorage.setItem('eco-lang', finalLang);
        if (i18n.language !== finalLang) i18n.changeLanguage(finalLang);
        document.documentElement.lang = finalLang;
        document.documentElement.dir = finalLang === 'ar' ? 'rtl' : 'ltr';
    } catch {}
    return finalLang;
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token    = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const savedLang = localStorage.getItem('eco-lang');
        if (token && userData) {
            try {
                const parsed = JSON.parse(userData);
                const activeLang = syncLang(savedLang || parsed.preferredLang || 'fr');
                const syncedUser = { ...parsed, preferredLang: activeLang };
                setUser(syncedUser);
                localStorage.setItem('user', JSON.stringify(syncedUser));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else {
            syncLang(savedLang || 'fr');
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await loginAPI({ email, password });
        const activeLang = syncLang(res.data.user?.preferredLang || localStorage.getItem('eco-lang') || 'fr');
        const syncedUser = { ...res.data.user, preferredLang: activeLang };
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(syncedUser));
        setUser(syncedUser);
        return res.data;
    };

    const register = async (formData) => {
        const res = await registerAPI(formData);
        const activeLang = syncLang(formData.preferredLang || res.data.user?.preferredLang || 'fr');
        const syncedUser = { ...res.data.user, preferredLang: activeLang };
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(syncedUser));
        setUser(syncedUser);
        return res.data;
    };

    // Met à jour le user sans jamais écraser la langue choisie lors des rafraîchissements silencieux
    const updateUser = (updatedFields, forceLangSync = false) => {
        setUser((prev) => {
            const currentLang = (localStorage.getItem('eco-lang') || i18n.language || prev?.preferredLang || 'fr').slice(0, 2);
            const targetLang = forceLangSync && updatedFields?.preferredLang
                ? syncLang(updatedFields.preferredLang)
                : currentLang;
            const newUser = { ...(prev || {}), ...updatedFields, preferredLang: targetLang };
            try {
                localStorage.setItem('user', JSON.stringify(newUser));
            } catch {}
            return newUser;
        });
    };

    // Changement explicite de langue depuis LanguageSwitcher ou Profile : fixe local + serveur
    const changeLanguage = async (code) => {
        const finalLang = syncLang(code);
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, preferredLang: finalLang };
            try {
                localStorage.setItem('user', JSON.stringify(updated));
            } catch {}
            return updated;
        });
        if (localStorage.getItem('token')) {
            try {
                await updateMyLang(finalLang);
            } catch {}
        }
        return finalLang;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, changeLanguage, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
};
