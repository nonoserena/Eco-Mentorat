import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import logoEco from '../assets/logo-eco.svg';

const FEATURES = [
    {
        icon: '🎯',
        title: 'Mise en relation intelligente',
        description: 'Décris ton problème en langage naturel. Notre système détecte automatiquement la matière et alerte uniquement les mentors compétents.'
    },
    {
        icon: '🔒',
        title: 'Chat privé sécurisé',
        description: 'Un espace de discussion chiffré s\'ouvre entre toi et ton mentor. Partage des messages, photos de cahiers et documents PDF en toute sécurité.'
    },
    {
        icon: '⭐',
        title: 'Algorithme de réputation anti-triche',
        description: 'Chaque mentor est évalué selon 3 facteurs : pédagogie (20%), sérieux (60%) et diversité des aides (20%). Impossible de tricher.'
    },
    {
        icon: '🎮',
        title: 'Système de gamification',
        description: 'Gagne des XP à chaque session, monte en grade de Novice à Légende et apparais dans le classement de ta matière.'
    },
    {
        icon: '📄',
        title: 'Portfolio certifié',
        description: 'Télécharge un portfolio PDF officiel avec tes statistiques réelles validées par nos algorithmes. Un atout pour ton CV.'
    },
    {
        icon: '🤝',
        title: '100% gratuit et équitable',
        description: 'Eco-Mentorat est entièrement gratuit. Notre système invisible garantit l\'équilibre entre donneurs et receveurs d\'aide.'
    }
];

const STEPS = [
    {
        num: '01',
        title: 'Crée ton profil',
        description: 'Inscris-toi et sélectionne tes super-pouvoirs académiques parmi nos badges de compétences.',
        icon: '👤'
    },
    {
        num: '02',
        title: 'Publie ta demande',
        description: 'Décris ton problème simplement. Le système identifie la matière et alerte les bons mentors en temps réel.',
        icon: '📝'
    },
    {
        num: '03',
        title: 'Reçois de l\'aide',
        description: 'Un mentor accepte, un chat privé s\'ouvre. Discutez, partagez des documents jusqu\'à la compréhension.',
        icon: '💬'
    },
    {
        num: '04',
        title: 'Note et progresse',
        description: 'Note ton mentor, gagne des XP, monte en grade et construis ton portfolio de compétences certifié.',
        icon: '🏆'
    }
];

const TESTIMONIALS = [
    {
        name: 'Adjoua M.',
        role: 'L2 Informatique',
        avatar: 'A',
        color: 'from-blue-500 to-violet-500',
        text: 'J\'étais bloquée sur les pointeurs en C depuis des heures. En 10 minutes sur Eco-Mentorat, un mentor m\'a tout expliqué avec des exemples. Incroyable !'
    },
    {
        name: 'Kofi B.',
        role: 'L3 Génie Logiciel',
        avatar: 'K',
        color: 'from-green-500 to-teal-500',
        text: 'En tant que mentor, j\'ai aidé plus de 15 étudiants en Java ce mois-ci. Mon score de réputation est à 4.8/5 et mon portfolio attire déjà des recruteurs.'
    },
    {
        name: 'Aminata S.',
        role: 'L1 Droit',
        avatar: 'A',
        color: 'from-orange-500 to-red-500',
        text: 'La plateforme est simple et efficace. J\'ai trouvé de l\'aide pour mon cours de droit des contrats en quelques minutes. Je recommande à tous !'
    }
];

export default function Landing() {
    const { t } = useTranslation();
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">

            {/* ── NAVBAR ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo Eco-Mentorat + Meta AI */}
                                        <div className="flex items-center gap-2">
                                            <img src={logoEco} alt="Eco-Mentorat logo" className="w-9 h-9" loading="eager" />
                                            <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                                                Eco-Mentorat
                                            </span>
                                            <span className="hidden sm:inline-flex text-[11px] font-bold px-2 py-1 rounded-full bg-meta-50 text-meta-600 border border-meta-500/20">Powered by Meta AI</span>
                                        </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Toggle mode sombre */}
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            title={isDark ? 'Mode clair' : 'Mode sombre'}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-900 dark:hover:text-white transition px-3 py-2"
                        >
                            {t('landing.login')}
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-semibold bg-gradient-to-r from-blue-900 to-violet-600 text-white px-4 py-2 rounded-xl hover:from-blue-800 hover:to-violet-500 transition shadow-md"
                        >
                            {t('landing.startFree')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">

                    {/* Badges Meta + Low-débit */}
                                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-eco-50 text-eco-600 border border-eco-500/20">🌍 Douala ⇄ Osaka sans apprendre la langue de l'autre</span>
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-meta-50 text-meta-600 border border-meta-500/20">✨ NLLB-200 + Llama 3 + Seamless</span>
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border">📶 Works on 2G</span>
                                        </div>

                                        {/* Titre */}
                                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.05]">
                                            {t('landing.title1')}
                                            <br />
                                            <span className="text-gradient-eco-meta">
                                                {t('landing.title2')}
                                            </span>
                                        </h1>

                                        {/* Sous-titre */}
                                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                                            {t('landing.heroSub')}</p>

                                        {/* Démo live FR -> JA */}
                                        <div className="max-w-xl mx-auto mb-10 grid gap-3 text-left">
                                            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                                <p className="text-xs font-bold text-eco-600 mb-1">🇨🇲 Douala — en français :</p>
                                                <p className="text-sm text-gray-800 dark:text-gray-100">Salut ! Je bloque sur ma boucle for en Python, tu peux m'expliquer ?</p>
                                            </div>
                                            <div className="bg-gradient-eco-meta rounded-2xl p-4 shadow-lg text-left">
                                                <p className="text-xs font-bold text-white/80 mb-1">🇯🇵 Osaka — reçoit en japonais : <span className="bg-white/20 px-1 rounded">Traduit par Meta AI</span></p>
                                                <p className="text-sm text-white font-semibold">こんにちは！Pythonのforループで困っています、説明してもらえますか？</p>
                                            </div>
                                        </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto bg-gradient-eco-meta text-white font-bold px-8 py-4 rounded-xl transition shadow-lg text-base"
                        >
                            {t('landing.ctaJoin')} 🚀
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 font-semibold px-8 py-4 rounded-xl transition text-base"
                        >
                            {t('landing.ctaHaveAccount')}
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-14">
                        {[
                            { value: '100%', label: 'Gratuit' },
                            { value: '3 facteurs', label: 'Anti-triche' },
                            { value: '5⭐', label: 'Réputation certifiée' },
                            { value: '<5min', label: 'Temps de réponse' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl font-extrabold text-gradient-eco-meta">
                                    {stat.value}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FONCTIONNALITÉS ── */}
            <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {t('landing.featTitle')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            Eco-Mentorat réunit toutes les fonctionnalités pour une entraide académique efficace, équitable et sécurisée.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/30 dark:to-violet-900/30 rounded-xl flex items-center justify-center text-2xl mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COMMENT ÇA MARCHE ── */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {t('landing.howTitle')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            En 4 étapes simples, passe du blocage à la compréhension.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map((step, i) => (
                            <div key={i} className="relative">
                                {/* Connecteur */}
                                {i < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-200 to-violet-200 dark:from-blue-800 dark:to-violet-800 z-0" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }}></div>
                                )}

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center relative z-10">
                                    {/* Numéro */}
                                    <div className="text-xs font-bold text-violet-400 dark:text-violet-400 mb-3 tracking-widest">
                                        ÉTAPE {step.num}
                                    </div>

                                    {/* Icône */}
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-violet-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">
                                        {step.icon}
                                    </div>

                                    <h3 className="text-gray-900 dark:text-white font-semibold mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TÉMOIGNAGES ── */}
            <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Ce qu'ils en pensent
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            Des étudiants qui ont trouvé de l'aide ou aidé leurs camarades sur Eco-Mentorat.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
                            >
                                {/* Étoiles */}
                                <div className="text-yellow-400 text-sm mb-4">★★★★★</div>

                                {/* Texte */}
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5 italic">
                                    "{item.text}"
                                </p>

                                {/* Auteur */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm`}>
                                        {item.avatar}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-semibold text-sm">{item.name}</p>
                                        <p className="text-gray-400 text-xs">{item.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-blue-900 to-violet-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                        {/* Cercles déco */}
                        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/5 rounded-full"></div>
                        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-white/5 rounded-full"></div>

                        <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
                            {t('landing.ctaFinalTitle')}
                        </h2>
                        <p className="text-blue-100 mb-8 relative z-10 leading-relaxed">
                            {t('landing.ctaFinalSub')}</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-white text-blue-900 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition shadow-lg text-base"
                            >
                                {t('landing.ctaCreate')} 🚀
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:border-white/60 transition text-base"
                            >
                                {t('landing.login')} →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src={logoEco} alt="logo Eco-Mentorat" className="w-6 h-6" />
                                                <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">Eco-Mentorat</span>
                                                <span className="text-[11px] text-gray-400">Powered by Meta AI • Works on 2G</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                        © 2025 Eco-Mentorat · 100% gratuit · Sécurisé · Anti-triche
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <Link to="/register" className="hover:text-gray-600 dark:hover:text-gray-300 transition">S'inscrire</Link>
                        <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-300 transition">{t('landing.login')}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}