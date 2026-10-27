const User = require('../models/User');
const AppError = require('../errors/AppError');
const { nettoyerEtRegrouperTag } = require('../utils/tagNormalizer');

class UserService {
    /**
     * Récupère le classement général ou sectoriel
     */
    static async getLeaderboard({ skill = null }) {
        if (skill) {
            const tagStd = nettoyerEtRegrouperTag(skill);
            const mentors = await User.find({ 'skillsMetrics.skillTag': tagStd })
                .select('username skillsMetrics isIncognito rankTitle xpPoints')
                .lean();

            const leaderboard = mentors
                .map(user => {
                    const metric = user.skillsMetrics.find(m => m.skillTag === tagStd);
                    return {
                        username: user.isIncognito
                            ? `AnonymousMentor_${user._id.toString().substring(0, 5)}`
                            : user.username,
                        rankTitle: user.rankTitle || 'Novice',
                        skillTag: tagStd,
                        reputationScore: metric ? metric.reputationScore : 5.0,
                        sessionsCompleted: metric ? Math.max(0, metric.helpCount - 1) : 0
                    };
                })
                .sort((a, b) => b.reputationScore - a.reputationScore)
                .map((user, i) => ({ rank: i + 1, ...user }));

            return {
                mode: 'Classement Sectoriel',
                tagTarget: tagStd,
                totalParticipants: leaderboard.length,
                leaderboard
            };
        }

        const leaders = await User.find({})
            .sort({ xpPoints: -1 })
            .select('username xpPoints skillsMetrics isIncognito rankTitle')
            .lean();

        const leaderboard = leaders.map((user, i) => {
            const totalScores = user.skillsMetrics.reduce((acc, m) => acc + m.reputationScore, 0);
            const globalRep = user.skillsMetrics.length > 0
                ? (totalScores / user.skillsMetrics.length).toFixed(1)
                : '5.0';
            return {
                rank: i + 1,
                username: user.isIncognito
                    ? `AnonymousMentor_${user._id.toString().substring(0, 5)}`
                    : user.username,
                xpPoints: user.xpPoints,
                rankTitle: user.rankTitle || 'Novice',
                globalReputation: parseFloat(globalRep)
            };
        });

        return {
            mode: 'Classement Général',
            totalParticipants: leaderboard.length,
            leaderboard
        };
    }

    /**
     * Récupère le profil authentifié de l'utilisateur courant
     */
    static async updatePreferredLang(userId, preferredLang) {
        const lang = String(preferredLang || '').toLowerCase().trim();
        const allowed = ['fr', 'en', 'ja', 'zh', 'wo', 'es', 'ar', 'pt'];
        if (!allowed.includes(lang)) throw new AppError('Langue non supportée.', 400);
        const user = await User.findByIdAndUpdate(userId, { preferredLang: lang }, { new: true }).lean();
        if (!user) throw new AppError('Utilisateur introuvable.', 404);
        return { id: user._id, username: user.username, email: user.email, preferredLang: user.preferredLang };
    }

    static async getMyProfile(userId) {
        const user = await User.findById(userId).lean();
        if (!user) {
            throw new AppError('Utilisateur introuvable.', 404);
        }

        return {
            id: user._id,
            username: user.username,
            email: user.email,
            preferredLang: user.preferredLang || 'fr',
            xpPoints: user.xpPoints,
            rankTitle: user.rankTitle,
            requestsLeft: user.requestsLeft,
            skillsDeclarated: user.skillsDeclarated,
            skillsMetrics: user.skillsMetrics
        };
    }

    /**
     * NOUVEAU : Récupère le profil public d'un mentor pour le recrutement (CV / LinkedIn)
     */
    static async getPublicProfile(username) {
        const user = await User.findOne({ username }).lean();
        if (!user) {
            throw new AppError('Profil public introuvable.', 404);
        }

        const totalScores = user.skillsMetrics.reduce((acc, m) => acc + m.reputationScore, 0);
        const globalRep = user.skillsMetrics.length > 0
            ? (totalScores / user.skillsMetrics.length).toFixed(1)
            : '5.0';

        const totalHelped = user.skillsMetrics.reduce((acc, m) => acc + Math.max(0, m.helpCount - 1), 0);

        return {
            username: user.username,
            rankTitle: user.rankTitle,
            xpPoints: user.xpPoints,
            globalReputation: parseFloat(globalRep),
            totalHelped,
            skillsDeclarated: user.skillsDeclarated,
            skillsMetrics: user.skillsMetrics.map(m => ({
                skillTag: m.skillTag,
                reputationScore: m.reputationScore,
                sessionsCompleted: Math.max(0, m.helpCount - 1)
            }))
        };
    }
}

module.exports = UserService;
