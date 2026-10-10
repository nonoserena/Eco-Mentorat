import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getLeaderboard } from '../../services/api';

const SKILL_TAGS = ['', '#java', '#reseau', '#linux', '#python', '#droit', '#web', '#mathematiques', '#physique'];

export default function Leaderboard() {
    const [leaders, setLeaders]   = useState([]);
    const [skill, setSkill]       = useState('');
    const [mode, setMode]         = useState('');
    const [loading, setLoading]   = useState(true);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await getLeaderboard(skill);
            setLeaders(res.data.leaderboard);
            setMode(res.data.mode);
        } catch {
            setLeaders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeaderboard(); }, [skill]);

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankTitleStyle = (rankTitle) => {
        const styles = {
            'Novice':   'bg-gray-100 text-gray-600',
            'Apprenti': 'bg-blue-100 text-blue-700',
            'Confirmé': 'bg-green-100 text-green-700',
            'Expert':   'bg-orange-100 text-orange-700',
            'Légende':  'bg-purple-100 text-purple-700',
        };
        return styles[rankTitle] || 'bg-gray-100 text-gray-600';
    };

    const getTagStyle = (tag) => {
        const styles = {
            '#java':          'bg-orange-100 text-orange-700',
            '#reseau':        'bg-blue-100 text-blue-700',
            '#linux':         'bg-green-100 text-green-700',
            '#python':        'bg-yellow-100 text-yellow-700',
            '#droit':         'bg-purple-100 text-purple-700',
            '#web':           'bg-pink-100 text-pink-700',
            '#mathematiques': 'bg-red-100 text-red-700',
            '#physique':      'bg-cyan-100 text-cyan-700',
        };
        return styles[tag] || 'bg-gray-100 text-gray-600';
    };

    return (
        <DashboardLayout>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Classement 🏆</h1>
                <p className="text-gray-500 text-sm mt-1">{mode}</p>
            </div>

            {/* Top 3 podium */}
            {!loading && leaders.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* 2ème place */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center mt-6">
                        <div className="text-3xl mb-2">🥈</div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                            {leaders[1]?.username?.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-800 text-sm truncate">{leaders[1]?.username}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {skill ? `⭐ ${leaders[1]?.reputationScore}/5` : `⚡ ${leaders[1]?.xpPoints} XP`}
                        </p>
                    </div>

                    {/* 1ère place */}
                    <div className="bg-gradient-to-b from-yellow-50 to-white rounded-2xl border-2 border-yellow-200 shadow-md p-5 text-center">
                        <div className="text-3xl mb-2">🥇</div>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow-md">
                            {leaders[0]?.username?.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-gray-800 truncate">{leaders[0]?.username}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {skill ? `⭐ ${leaders[0]?.reputationScore}/5` : `⚡ ${leaders[0]?.xpPoints} XP`}
                        </p>
                        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                            Champion 👑
                        </span>
                    </div>

                    {/* 3ème place */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center mt-6">
                        <div className="text-3xl mb-2">🥉</div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                            {leaders[2]?.username?.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-800 text-sm truncate">{leaders[2]?.username}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {skill ? `⭐ ${leaders[2]?.reputationScore}/5` : `⚡ ${leaders[2]?.xpPoints} XP`}
                        </p>
                    </div>
                </div>
            )}

            {/* Filtre par matière */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Filtrer par matière
                </p>
                <div className="flex flex-wrap gap-2">
                    {SKILL_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSkill(tag)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                                skill === tag
                                    ? 'bg-gradient-to-r from-blue-900 to-violet-600 text-white border-transparent'
                                    : `bg-white border-gray-200 hover:border-blue-400 ${tag ? getTagStyle(tag) : 'text-gray-600'}`
                            }`}
                        >
                            {tag || '🌍 Général'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tableau classement */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : leaders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-4xl mb-3">🏆</p>
                    <p className="text-gray-500">Aucun mentor classé pour cette matière.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* En-tête */}
                    <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1">Rang</div>
                        <div className="col-span-5">Mentor</div>
                        <div className="col-span-3">Grade</div>
                        <div className="col-span-3 text-right">Score</div>
                    </div>

                    {leaders.map((leader, i) => (
                        <div
                            key={i}
                            className={`grid grid-cols-12 px-5 py-4 border-b border-gray-50 last:border-0 items-center transition hover:bg-gray-50/50 ${
                                leader.rank <= 3 ? 'bg-yellow-50/20' : ''
                            }`}
                        >
                            {/* Rang */}
                            <div className="col-span-1 text-lg font-bold">
                                {getRankEmoji(leader.rank)}
                            </div>

                            {/* Mentor */}
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-900 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {leader.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{leader.username}</p>
                                    {skill && (
                                        <p className="text-gray-400 text-xs">
                                            {leader.sessionsCompleted} session(s) complétée(s)
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Grade */}
                            <div className="col-span-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRankTitleStyle(leader.rankTitle)}`}>
                                    {leader.rankTitle || 'Novice'}
                                </span>
                            </div>

                            {/* Score */}
                            <div className="col-span-3 text-right">
                                {skill ? (
                                    <div>
                                        <span className="text-blue-900 font-bold">⭐ {leader.reputationScore}/5</span>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-blue-900 font-bold">⚡ {leader.xpPoints} XP</span>
                                        <p className="text-gray-400 text-xs mt-0.5">Rep: {leader.globalReputation}/5</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}