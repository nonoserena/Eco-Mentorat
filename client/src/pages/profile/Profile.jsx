import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getPortfolio, getMyProfile, updateMyLang } from '../../services/api';

const getRankStyle = (rank) => {
    const styles = {
        'Novice':   { bg: 'bg-gray-100',   text: 'text-gray-600',   bar: 'bg-gray-400' },
        'Apprenti': { bg: 'bg-blue-100',   text: 'text-blue-700',   bar: 'bg-blue-500' },
        'Confirmé':  { bg: 'bg-green-100',  text: 'text-green-700',  bar: 'bg-green-500' },
        'Expert':   { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' },
        'Légende':   { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
    };
    return styles[rank] || styles['Novice'];
};

const getXPProgress = (xp) => {
    const thresholds     = [0, 200, 800, 2000, 5000];
    const nextThresholds = [200, 800, 2000, 5000, 10000];
    let level = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (xp >= thresholds[i]) { level = i; break; }
    }
    const current = thresholds[level];
    const next    = nextThresholds[level];
    return Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
};

const RANK_MILESTONES = [
    { title: 'Novice',   xp: 0,    emoji: 'ðŸŒ±' },
    { title: 'Apprenti', xp: 200,  emoji: 'ðŸ“š' },
    { title: 'Confirme', xp: 800,  emoji: 'ðŸ’¡' },
    { title: 'Expert',   xp: 2000, emoji: 'ðŸ†' },
    { title: 'Legende',  xp: 5000, emoji: 'ðŸŒŸ' },
];

const TAG_COLORS = {
    '#java':          'bg-orange-100 text-orange-700',
    '#reseau':        'bg-blue-100 text-blue-700',
    '#linux':         'bg-green-100 text-green-700',
    '#python':        'bg-yellow-100 text-yellow-700',
    '#droit':         'bg-purple-100 text-purple-700',
    '#web':           'bg-pink-100 text-pink-700',
    '#mathematiques': 'bg-red-100 text-red-700',
    '#physique':      'bg-cyan-100 text-cyan-700',
};

export default function Profile() {
    const { user, updateUser }      = useAuth();
    const [downloading, setDownloading] = useState(false);
    const [freshData, setFreshData] = useState(null);
    const [loading, setLoading]     = useState(true);

    const rankStyle  = getRankStyle(user?.rankTitle);
    const xpProgress = getXPProgress(user?.xpPoints ?? 0);

    // FIX: charger les donnÃ©es fraÃ®ches du profil au montage
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfile();
                setFreshData(res.data.user);
                updateUser(res.data.user);
            } catch (err) {
                console.error('Erreur chargement profil:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const profileData = freshData || user;

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const res  = await getPortfolio(user.id);
            const url  = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href  = url;
            link.setAttribute('download', `Portfolio_EcoMentorat_${user.username}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Erreur lors du tÃ©lÃ©chargement du portfolio.');
        } finally {
            setDownloading(false);
        }
    };

    const getReputationColor = (score) => {
        if (score >= 4.5) return 'text-green-600';
        if (score >= 3.5) return 'text-blue-600';
        if (score >= 2.5) return 'text-yellow-600';
        return 'text-red-500';
    };

    const getReputationBar = (score) => {
        if (score >= 4.5) return 'bg-green-500';
        if (score >= 3.5) return 'bg-blue-500';
        if (score >= 2.5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Mon Profil ðŸ‘¤</h1>
                    <p className="text-gray-500 text-sm mt-1">Tes statistiques et ton parcours acadÃ©mique</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Carte profil principale */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                            <div className="flex items-center gap-6">
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                        {profileData?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm ${rankStyle.bg} shadow-sm border-2 border-white`}>
                                        {RANK_MILESTONES.find(r => r.title === profileData?.rankTitle)?.emoji || 'ðŸŒ±'}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-xl font-bold text-gray-800">{profileData?.username}</h2>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rankStyle.bg} ${rankStyle.text}`}>
                                            {profileData?.rankTitle || 'Novice'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-3">{profileData?.email}</p>
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-xs text-gray-500">ðŸŒ Langue pays :</span>
                                      <select value={profileData?.preferredLang || 'fr'} onChange={async (e) => { try { const res = await updateMyLang(e.target.value); updateUser(res.data.user); setFreshData((p) => ({ ...(p || profileData), preferredLang: res.data.user.preferredLang })); localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), preferredLang: res.data.user.preferredLang })); } catch { alert('Changement de langue impossible.'); } }} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400">
                                        <option value="fr">ðŸ‡«ðŸ‡· FranÃ§ais</option>
                                        <option value="ja">ðŸ‡¯ðŸ‡µ æ—¥æœ¬èªž</option>
                                        <option value="ar">ðŸ‡²ðŸ‡¦ Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©</option>
                                        <option value="pt">ðŸ‡§ðŸ‡· PortuguÃªs</option>
                                        <option value="en">ðŸ‡¬ðŸ‡§ English</option>
                                        <option value="es">ðŸ‡ªðŸ‡¸ EspaÃ±ol</option>
                                        <option value="wo">ðŸ‡¸ðŸ‡³ Wolof</option>
                                        <option value="zh">ðŸ‡¨ðŸ‡³ ä¸­æ–‡</option>
                                      </select>
                                      <span className="text-[11px] text-gray-400">Feed traduit auto via Muse</span>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-500">Progression XP</span>
                                            <span className="text-xs font-bold text-blue-900">âš¡ {profileData?.xpPoints ?? 0} XP</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${rankStyle.bar}`}
                                                style={{ width: `${xpProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{xpProgress}% vers le prochain grade</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={downloading}
                                    className="flex-shrink-0 flex flex-col items-center gap-1 bg-gradient-to-r from-blue-900 to-violet-600 hover:from-blue-800 hover:to-violet-500 text-white px-5 py-3 rounded-xl transition shadow-md disabled:opacity-60"
                                >
                                    <span className="text-xl">ðŸ“„</span>
                                    <span className="text-xs font-semibold whitespace-nowrap">
                                        {downloading ? 'GÃ©nÃ©ration...' : 'Mon Portfolio'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            {[
                                { icon: 'âš¡', label: 'XP Total',     value: profileData?.xpPoints ?? 0,                 sub: "points d'expÃ©rience" },
                                { icon: 'ðŸ§ ', label: 'CompÃ©tences',  value: profileData?.skillsDeclarated?.length ?? 0, sub: 'matiÃ¨res dÃ©clarÃ©es' },
                                { icon: 'ðŸŽ–ï¸', label: 'Grade actuel', value: profileData?.rankTitle || 'Novice',          sub: 'niveau atteint' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">{stat.icon}</div>
                                        <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-5 mb-5">
                            {/* CompÃ©tences */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-base font-semibold text-gray-800 mb-4">Mes super-pouvoirs ðŸ¦¸</h3>
                                {profileData?.skillsDeclarated?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.skillsDeclarated.map(skill => (
                                            <span
                                                key={skill}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${TAG_COLORS[skill] || 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">Aucune compÃ©tence dÃ©clarÃ©e.</p>
                                )}
                            </div>

                            {/* Parcours des grades */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-base font-semibold text-gray-800 mb-4">Parcours des grades ðŸŽ¯</h3>
                                <div className="space-y-3">
                                    {RANK_MILESTONES.map((milestone, i) => {
                                        const reached  = (profileData?.xpPoints ?? 0) >= milestone.xp;
                                        const current  = profileData?.rankTitle === milestone.title;
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                                                    reached ? 'bg-gradient-to-br from-blue-900 to-violet-600' : 'bg-gray-100'
                                                }`}>
                                                    <span>{milestone.emoji}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm font-medium ${reached ? 'text-gray-800' : 'text-gray-400'}`}>
                                                            {milestone.title}
                                                            {current && (
                                                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                                    Actuel
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{milestone.xp} XP</span>
                                                    </div>
                                                </div>
                                                {reached && <span className="text-green-500 text-sm">âœ“</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* âœ… NOUVELLE SECTION : RÃ©putation par matiÃ¨re */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-1">
                                Mes scores de rÃ©putation par matiÃ¨re â­
                            </h3>
                            <p className="text-gray-400 text-xs mb-5">
                                CalculÃ©s Ã  partir de tes sessions d'entraide validÃ©es
                            </p>

                            {!profileData?.skillsMetrics || profileData.skillsMetrics.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-3xl mb-2">ðŸŽ“</p>
                                    <p className="text-gray-400 text-sm">
                                        Aucune session validÃ©e pour le moment.
                                    </p>
                                    <p className="text-gray-300 text-xs mt-1">
                                        Aide un camarade pour voir apparaÃ®tre tes scores !
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profileData.skillsMetrics.map((metric, i) => {
                                        const sessionsReelles = metric.helpCount - 1;
                                        const tauxSerieux     = metric.acceptedCount > 0
                                            ? Math.round((metric.helpCount / metric.acceptedCount) * 100)
                                            : 0;

                                        return (
                                            <div key={i} className="border border-gray-100 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TAG_COLORS[metric.skillTag] || 'bg-gray-100 text-gray-700'}`}>
                                                            {metric.skillTag}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">
                                                            {sessionsReelles} session{sessionsReelles > 1 ? 's' : ''} complÃ©tÃ©e{sessionsReelles > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xl font-bold ${getReputationColor(metric.reputationScore)}`}>
                                                        {metric.reputationScore}/5
                                                    </span>
                                                </div>

                                                {/* Barre de rÃ©putation globale */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Score de rÃ©putation</span>
                                                        <span>{metric.reputationScore}/5.0</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${getReputationBar(metric.reputationScore)}`}
                                                            style={{ width: `${(metric.reputationScore / 5) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* DÃ©tails des 3 facteurs */}
                                                <div className="grid grid-cols-3 gap-3 mt-3">
                                                    {/* PÃ©dagogie */}
                                                    <div className="text-center bg-blue-50 rounded-lg p-2">
                                                        <p className="text-xs text-gray-500 mb-1">ðŸŽ¯ PÃ©dagogie</p>
                                                        <p className="text-sm font-bold text-blue-700">
                                                            {metric.helpCount > 0
                                                                ? (metric.totalStars / metric.helpCount).toFixed(1)
                                                                : '5.0'}/5
                                                        </p>
                                                        <p className="text-xs text-gray-400">20%</p>
                                                    </div>

                                                    {/* SÃ©rieux */}
                                                    <div className="text-center bg-green-50 rounded-lg p-2">
                                                        <p className="text-xs text-gray-500 mb-1">ðŸ’ª SÃ©rieux</p>
                                                        <p className="text-sm font-bold text-green-700">
                                                            {tauxSerieux}%
                                                        </p>
                                                        <p className="text-xs text-gray-400">60%</p>
                                                    </div>

                                                    {/* DiversitÃ© */}
                                                    <div className="text-center bg-purple-50 rounded-lg p-2">
                                                        <p className="text-xs text-gray-500 mb-1">ðŸ¤ DiversitÃ©</p>
                                                        <p className="text-sm font-bold text-purple-700">
                                                            {metric.uniqueUsersHelped?.length ?? 0} Ã©tud.
                                                        </p>
                                                        <p className="text-xs text-gray-400">20%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}