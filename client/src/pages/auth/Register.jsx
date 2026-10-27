import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SKILL_TAGS_OFFICIELS = [
    '#Java', '#Python', '#Réseaux', '#Linux',
    '#Droit', '#Web', '#Mathématiques', '#Physique',
    '#Comptabilité', '#Marketing', '#Anglais', '#Bases de données'
];

export default function Register() {
    const { register } = useAuth();
    const navigate     = useNavigate();

    const [step, setStep]   = useState(1); // Étape 1 : infos, Étape 2 : compétences
    const [formData, setFormData] = useState({
            username: '', email: '', password: '', confirmPassword: '', preferredLang: 'fr'
        });
    const [skillsSelectionnés, setSkillsSelectionnés] = useState([]);
    const [autreSkill, setAutreSkill]                 = useState('');
    const [error, setError]                           = useState('');
    const [loading, setLoading]                       = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const toggleSkill = (tag) => {
        if (skillsSelectionnés.includes(tag)) {
            setSkillsSelectionnés(skillsSelectionnés.filter(s => s !== tag));
        } else if (skillsSelectionnés.length < 5) {
            setSkillsSelectionnés([...skillsSelectionnés, tag]);
        }
    };

    const ajouterAutreSkill = () => {
        const tag = autreSkill.trim();
        if (!tag) return;
        if (skillsSelectionnés.length >= 5) return setError('Maximum 5 compétences.');
        const tagFormate = `#${tag.toLowerCase().replace(/\s+/g, '')}`;
        if (!skillsSelectionnés.includes(tagFormate)) {
            setSkillsSelectionnés([...skillsSelectionnés, tagFormate]);
        }
        setAutreSkill('');
    };

    const handleStep1 = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Les mots de passe ne correspondent pas.');
        }
        if (formData.password.length < 8) {
            return setError('Le mot de passe doit contenir au moins 8 caractères.');
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await register({
                            username: formData.username,
                            email: formData.email,
                            password: formData.password,
                            skillsDeclarated: skillsSelectionnés,
                            preferredLang: formData.preferredLang || 'fr'
                        });
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ── CÔTÉ GAUCHE : Branding ── */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-700 to-violet-600 flex-col items-center justify-center px-12 relative overflow-hidden">

                {/* Cercles décoratifs */}
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/5 rounded-full"></div>
                <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-white/5 rounded-full"></div>

                {/* Illustration SVG */}
                <svg viewBox="0 0 400 350" className="w-80 h-80 mb-8" fill="none">
                    {/* Carte profil */}
                    <rect x="80" y="30" width="240" height="160" rx="16" fill="white" fillOpacity="0.15"/>
                    <circle cx="200" cy="90" r="35" fill="white" fillOpacity="0.3"/>
                    <circle cx="200" cy="80" r="20" fill="white" fillOpacity="0.6"/>
                    <ellipse cx="200" cy="115" rx="28" ry="14" fill="white" fillOpacity="0.4"/>
                    <rect x="140" y="140" width="120" height="10" rx="5" fill="white" fillOpacity="0.3"/>
                    <rect x="160" y="158" width="80" height="8" rx="4" fill="white" fillOpacity="0.2"/>

                    {/* Badges compétences */}
                    {[
                        { x: 80, y: 210, label: '#Java', color: 'orange' },
                        { x: 160, y: 210, label: '#Python', color: 'yellow' },
                        { x: 248, y: 210, label: '#Linux', color: 'green' },
                        { x: 100, y: 255, label: '#Réseaux', color: 'blue' },
                        { x: 210, y: 255, label: '#Droit', color: 'purple' },
                    ].map((badge, i) => (
                        <g key={i}>
                            <rect x={badge.x} y={badge.y} width={badge.label.length * 8 + 16} height="26" rx="13" fill="white" fillOpacity="0.2"/>
                            <text x={badge.x + (badge.label.length * 8 + 16) / 2} y={badge.y + 17} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
                                {badge.label}
                            </text>
                        </g>
                    ))}

                    {/* Étoile XP */}
                    <text x="200" y="320" textAnchor="middle" fontSize="13" fill="white" fillOpacity="0.8">
                        ⚡ Gagne des XP en aidant !
                    </text>
                </svg>

                <h1 className="text-4xl font-bold text-white text-center mb-3">
                    Rejoins la communauté !
                </h1>
                <p className="text-blue-100 text-center text-base leading-relaxed max-w-xs">
                    Partage tes super-pouvoirs académiques et aide tes camarades à progresser.
                </p>

                {/* Étapes */}
                <div className="flex gap-6 mt-8">
                    {[
                        { num: '1', label: 'Ton profil' },
                        { num: '2', label: 'Tes super-pouvoirs' },
                        { num: '3', label: 'C\'est parti !' },
                    ].map((s, i) => (
                        <div key={i} className="text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-sm ${
                                step > i ? 'bg-white text-blue-900' : 'bg-white/20 text-white'
                            }`}>
                                {s.num}
                            </div>
                            <p className="text-blue-200 text-xs">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CÔTÉ DROIT : Formulaire ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 bg-gray-50 py-10">
                <div className="w-full max-w-md">

                    {/* Logo mobile */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-violet-600 bg-clip-text text-transparent">
                            Eco-Mentorat
                        </h1>
                    </div>

                    {/* ── ÉTAPE 1 : Informations de base ── */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-gradient-to-r from-blue-900 to-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        Étape 1/2
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mt-2">Crée ton profil</h2>
                                <p className="text-gray-500 text-sm mt-1">Quelques infos pour commencer.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <form onSubmit={handleStep1} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="ex: jean_dupont"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email académique
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="exemple@universite.cm"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="8 caractères minimum"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                    />
                                </div>

                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                        Confirmer le mot de passe
                                                                    </label>
                                                                    <input
                                                                        type="password"
                                                                        name="confirmPassword"
                                                                        value={formData.confirmPassword}
                                                                        onChange={handleChange}
                                                                        placeholder="••••••••"
                                                                        required
                                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                        🌍 Ma langue pays — le feed sera traduit pour moi
                                                                    </label>
                                                                    <select
                                                                        name="preferredLang"
                                                                        value={formData.preferredLang}
                                                                        onChange={handleChange}
                                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                                                    >
                                                                        <option value="fr">🇫🇷 Français (Cameroun)</option>
                                                                        <option value="ja">🇯🇵 日本語 (Osaka)</option>
                                                                        <option value="ar">🇲🇦 العربية (Maroc)</option>
                                                                        <option value="pt">🇧🇷 Português (Brésil)</option>
                                                                        <option value="en">🇬🇧 English</option>
                                                                        <option value="es">🇪🇸 Español</option>
                                                                        <option value="wo">🇸🇳 Wolof</option>
                                                                        <option value="zh">🇨🇳 中文</option>
                                                                    </select>
                                                                </div>

                                                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-900 to-violet-600 hover:from-blue-800 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition shadow-md mt-2"
                                >
                                    Continuer → Mes super-pouvoirs
                                </button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-5">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="text-violet-600 font-semibold hover:underline">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    )}

                    {/* ── ÉTAPE 2 : Sélection des compétences ── */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-gradient-to-r from-blue-900 to-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        Étape 2/2
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mt-2">Tes super-pouvoirs 🦸</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Dans quelles matières es-tu fort et prêt à aider tes camarades ?
                                    <span className="text-gray-400"> (max 5)</span>
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            {/* Compétences sélectionnées */}
                            {skillsSelectionnés.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 rounded-xl">
                                    {skillsSelectionnés.map(skill => (
                                        <span
                                            key={skill}
                                            className="flex items-center gap-1 bg-gradient-to-r from-blue-900 to-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => toggleSkill(skill)}
                                                className="ml-1 hover:text-red-200 font-bold"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Liste des badges officiels */}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Badges officiels — coche tes matières
                            </p>
                            <div className="flex flex-wrap gap-2 mb-5">
                                {SKILL_TAGS_OFFICIELS.map(tag => {
                                    const selected = skillsSelectionnés.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleSkill(tag)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition ${
                                                selected
                                                    ? 'bg-gradient-to-r from-blue-900 to-violet-600 text-white border-transparent'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-700'
                                            } ${skillsSelectionnés.length >= 5 && !selected ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            disabled={skillsSelectionnés.length >= 5 && !selected}
                                        >
                                            {selected ? '✓ ' : ''}{tag}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Case magique "Autre skillTag" */}
                            <div className="border-t border-gray-100 pt-4 mb-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    ✨ Autre compétence (case magique)
                                </p>
                                <p className="text-xs text-gray-400 mb-3">
                                    Ta matière n'est pas dans la liste ? Tape-la ici, l'application la rangera automatiquement !
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={autreSkill}
                                        onChange={(e) => setAutreSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && ajouterAutreSkill()}
                                        placeholder="ex: Thermodynamique, UML, Comptabilité..."
                                        disabled={skillsSelectionnés.length >= 5}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={ajouterAutreSkill}
                                        disabled={!autreSkill.trim() || skillsSelectionnés.length >= 5}
                                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition"
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                            </div>

                            {/* Compteur */}
                            <p className="text-xs text-gray-400 mb-4 text-center">
                                {skillsSelectionnés.length}/5 compétences sélectionnées
                            </p>

                            {/* Boutons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    ← Retour
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-violet-600 hover:from-blue-800 hover:to-violet-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition shadow-md"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Création...
                                        </span>
                                    ) : (
                                        "Créer mon compte 🚀"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Eco-Mentorat est 100% gratuit · Sécurisé · Anti-triche
                    </p>
                </div>
            </div>
        </div>
    );
}