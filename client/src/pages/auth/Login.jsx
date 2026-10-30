import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const { login }  = useAuth();
    const navigate   = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ── CÔTÉ GAUCHE : Illustration + Branding ── */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-700 to-violet-600 flex-col items-center justify-center px-12 relative overflow-hidden">

                {/* Cercles décoratifs */}
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/5 rounded-full"></div>
                <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-white/5 rounded-full"></div>
                <div className="absolute top-1/2 right-[-40px] w-48 h-48 bg-violet-400/10 rounded-full"></div>

                {/* Illustration SVG */}
                <svg viewBox="0 0 400 350" className="w-80 h-80 mb-8" fill="none">
                    {/* Écran / Tableau */}
                    <rect x="60" y="40" width="280" height="180" rx="16" fill="white" fillOpacity="0.15"/>
                    <rect x="60" y="40" width="280" height="36" rx="16" fill="white" fillOpacity="0.2"/>
                    <circle cx="84" cy="58" r="6" fill="#f87171"/>
                    <circle cx="104" cy="58" r="6" fill="#fbbf24"/>
                    <circle cx="124" cy="58" r="6" fill="#34d399"/>

                    {/* Lignes de code */}
                    <rect x="84" y="96" width="80" height="8" rx="4" fill="white" fillOpacity="0.4"/>
                    <rect x="84" y="116" width="120" height="8" rx="4" fill="violet" fillOpacity="0.5"/>
                    <rect x="84" y="136" width="60" height="8" rx="4" fill="white" fillOpacity="0.3"/>
                    <rect x="84" y="156" width="100" height="8" rx="4" fill="white" fillOpacity="0.4"/>
                    <rect x="84" y="176" width="70" height="8" rx="4" fill="violet" fillOpacity="0.3"/>

                    {/* Badge réputation */}
                    <rect x="240" y="90" width="80" height="90" rx="12" fill="white" fillOpacity="0.2"/>
                    <text x="280" y="125" textAnchor="middle" fontSize="22" fill="white">⭐</text>
                    <text x="280" y="148" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">4.8/5</text>
                    <text x="280" y="165" textAnchor="middle" fontSize="9" fill="white" fillOpacity="0.7">Réputation</text>

                    {/* Personnages */}
                    {/* Mentor */}
                    <circle cx="130" cy="280" r="28" fill="white" fillOpacity="0.2"/>
                    <circle cx="130" cy="268" r="14" fill="white" fillOpacity="0.6"/>
                    <ellipse cx="130" cy="300" rx="20" ry="12" fill="white" fillOpacity="0.4"/>

                    {/* Flèche entraide */}
                    <path d="M165 280 Q200 260 235 280" stroke="white" strokeWidth="2.5" strokeDasharray="6 3" fill="none" strokeOpacity="0.7"/>
                    <polygon points="235,274 245,280 235,286" fill="white" fillOpacity="0.7"/>

                    {/* Apprenant */}
                    <circle cx="270" cy="280" r="28" fill="white" fillOpacity="0.2"/>
                    <circle cx="270" cy="268" r="14" fill="white" fillOpacity="0.6"/>
                    <ellipse cx="270" cy="300" rx="20" ry="12" fill="white" fillOpacity="0.4"/>

                    {/* Labels */}
                    <text x="130" y="320" textAnchor="middle" fontSize="10" fill="white" fillOpacity="0.8">Mentor</text>
                    <text x="270" y="320" textAnchor="middle" fontSize="10" fill="white" fillOpacity="0.8">Apprenant</text>

                    {/* XP Badge */}
                    <rect x="155" y="240" width="90" height="28" rx="14" fill="white" fillOpacity="0.2"/>
                    <text x="200" y="259" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">+50 XP ⚡</text>
                </svg>

                {/* Texte branding */}
                <h1 className="text-4xl font-bold text-white text-center mb-3">
                    Eco-Mentorat
                </h1>
                <p className="text-blue-100 text-center text-base leading-relaxed max-w-xs">
                    La plateforme d'entraide académique où chaque étudiant peut enseigner et apprendre.
                </p>

                {/* Stats */}
                <div className="flex gap-8 mt-8">
                    {[
                        { value: '100%', label: 'Gratuit' },
                        { value: '48h', label: 'Anti-triche' },
                        { value: '5⭐', label: 'Réputation' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-white font-bold text-xl">{stat.value}</p>
                            <p className="text-blue-200 text-xs mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CÔTÉ DROIT : Formulaire ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 bg-gray-50">
                <div className="w-full max-w-md">

                    {/* Logo mobile (visible uniquement sur petits écrans) */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-violet-600 bg-clip-text text-transparent">
                            Eco-Mentorat
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Plateforme d'entraide académique</p>
                    </div>

                    {/* Card formulaire */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{t('login.welcome')} 👋</h2>
                            <p className="text-gray-500 text-sm mt-1">{t('login.subtitle')}</p>
                        </div>

                        {/* Erreur */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t('auth.email')}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="exemple@universite.cm"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* {t('auth.password')} */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t('auth.password')}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* Bouton */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-900 to-violet-600 hover:from-blue-800 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t('login.connecting')}
                                    </>
                                ) : (
                                                                    t('login.connectBtn')
                                                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-gray-100"></div>
                            <span className="text-gray-400 text-xs">ou</span>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        {/* Lien inscription */}
                        <p className="text-center text-sm text-gray-500">
                            {t('login.noAccount')}
                            <Link to="/register" className="text-violet-600 font-semibold hover:underline">
                                {t('login.join')}
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        {t('login.tagline')}
                    </p>
                </div>
            </div>
        </div>
    );
}