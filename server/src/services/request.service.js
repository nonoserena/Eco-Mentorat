const Request = require('../models/Request');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const { nettoyerEtRegrouperTag } = require('../utils/tagNormalizer');
const { contientContenuInterdit } = require('../utils/antiMarket');
const { calculerScorePondere } = require('../utils/reputation');
const { REPUTATION } = require('../config/constants');

class RequestService {
    /**
     * Publication d'une nouvelle demande d'aide
     */
    static async createRequest({ requesterId, title, description, skillTag }, socketManager = null) {
        if (contientContenuInterdit(title) || contientContenuInterdit(description)) {
            throw new AppError('Publication bloquée. Les transactions financières ou coordonnées privées sont interdites.', 400);
        }

        const student = await User.findById(requesterId);
        if (!student) throw new AppError('Utilisateur introuvable.', 404);

        if (student.requestsLeft <= 0) {
            throw new AppError("Tu as beaucoup sollicité la communauté ! Aide un camarade à son tour pour débloquer de nouveaux tickets.", 403);
        }

        const tagStd = nettoyerEtRegrouperTag(skillTag);
        const newRequest = new Request({
            requesterId,
            title,
            description,
            skillTag: tagStd
        });

        await newRequest.save();

        student.requestsLeft = Math.max(0, student.requestsLeft - 1);
        await student.save();

        // Notification temps réel aux mentors qualifiés
        let notifiesCount = 0;
        if (socketManager) {
            const potentialMentors = await User.find({
                skillsDeclarated: tagStd,
                _id: { $ne: requesterId }
            }).select('_id username');

            notifiesCount = socketManager.notifyMentors(potentialMentors, newRequest, tagStd);
        }

        return {
            request: newRequest,
            mentorsNotifies: notifiesCount
        };
    }

    /**
     * Récupérer toutes les demandes actives
     */
    static async getAllRequests({ page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            Request.find({ status: { $in: ['open', 'in-progress'] } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Request.countDocuments({ status: { $in: ['open', 'in-progress'] } })
        ]);

        return {
            total,
            page,
            totalPages: Math.ceil(total / limit),
            requests
        };
    }

    static async getMyRequests(requesterId, { page = 1, limit = 50 }) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            Request.find({ requesterId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Request.countDocuments({ requesterId })
        ]);

        return { total, page, totalPages: Math.ceil(total / limit), requests };
    }

    static async getMyHelps(mentorId, { page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            Request.find({ mentorId })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Request.countDocuments({ mentorId })
        ]);

        return { total, page, totalPages: Math.ceil(total / limit), requests };
    }

    static async getHistory({ page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            Request.find({ status: 'completed' })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Request.countDocuments({ status: 'completed' })
        ]);

        return { total, page, totalPages: Math.ceil(total / limit), requests };
    }

    static async getRequestById(requestId) {
        const request = await Request.findById(requestId).lean();
        if (!request) throw new AppError('Demande introuvable.', 404);
        return request;
    }

    /**
     * Prise en charge d'une demande par un mentor
     */
    static async acceptRequest(requestId, mentorId) {
        const request = await Request.findById(requestId);
        if (!request) throw new AppError('Demande introuvable.', 404);
        if (request.status !== 'open') throw new AppError('Cette demande a déjà été prise en charge.', 400);

        if (request.requesterId.toString() === mentorId.toString()) {
            throw new AppError('Vous ne pouvez pas être le mentor de votre propre demande.', 400);
        }

        request.mentorId = mentorId;
        request.status = 'in-progress';
        await request.save();

        const mentor = await User.findById(mentorId);
        if (mentor) {
            const tagStd = request.skillTag;
            const metricIndex = mentor.skillsMetrics.findIndex(m => m.skillTag === tagStd);
            if (metricIndex === -1) {
                mentor.skillsMetrics.push({
                    skillTag: tagStd,
                    reputationScore: 5.0,
                    totalStars: 5,
                    acceptedCount: 2,
                    helpCount: 1,
                    uniqueUsersHelped: []
                });
            } else {
                mentor.skillsMetrics[metricIndex].acceptedCount += 1;
            }
            await mentor.save();
        }

        return {
            status: request.status,
            requestId: request._id,
            requesterId: request.requesterId
        };
    }

    /**
     * Remplacement du mentor par l'apprenant
     */
    static async replaceMentor(requestId, requesterId) {
        const request = await Request.findById(requestId);
        if (!request) throw new AppError('Demande introuvable.', 404);

        if (request.requesterId.toString() !== requesterId.toString()) {
            throw new AppError("Seul l'apprenant peut remplacer le mentor.", 403);
        }

        if (request.status !== 'in-progress') {
            throw new AppError("La demande n'est pas en cours.", 400);
        }

        const oldMentor = await User.findById(request.mentorId);
        if (oldMentor) {
            const tagStd = request.skillTag;
            const metricIndex = oldMentor.skillsMetrics.findIndex(m => m.skillTag === tagStd);
            if (metricIndex !== -1) {
                oldMentor.skillsMetrics[metricIndex].acceptedCount += 3; // Pénalité ratio sérieux
            }
            await oldMentor.save();
        }

        request.replacedMentors.push(request.mentorId);
        request.mentorId = null;
        request.status = 'open';
        await request.save();

        return request;
    }

    /**
     * Clôture et notation d'une session par l'apprenant
     */
    static async completeRequest(requestId, requesterId, rating) {
        const request = await Request.findById(requestId);
        if (!request) throw new AppError('Demande introuvable.', 404);
        if (request.status !== 'in-progress') throw new AppError('Demande non active.', 400);

        if (request.requesterId.toString() !== requesterId.toString()) {
            throw new AppError("Seul l'apprenant peut clôturer et noter la session.", 403);
        }

        const mentorId = request.mentorId;
        const mentor = await User.findById(mentorId);
        if (!mentor) throw new AppError('Mentor introuvable.', 404);

        const tagStd = request.skillTag;
        let metricIndex = mentor.skillsMetrics.findIndex(m => m.skillTag === tagStd);

        if (metricIndex === -1) {
            mentor.skillsMetrics.push({
                skillTag: tagStd,
                reputationScore: 5.0,
                totalStars: 5,
                acceptedCount: 1,
                helpCount: 1,
                uniqueUsersHelped: []
            });
            metricIndex = mentor.skillsMetrics.length - 1;
        }

        const metric = mentor.skillsMetrics[metricIndex];

        // Mécanisme anti-collusion : vérifie si les 2 mêmes comptes ont interagi il y a moins de 48h
        const derniereEntraide = await Request.findOne({
            requesterId,
            mentorId,
            status: 'completed',
            createdAt: { $gte: new Date(Date.now() - REPUTATION.COLLUSION_WINDOW_HOURS * 60 * 60 * 1000) }
        });

        const appliquerPoidsNormal = !derniereEntraide;
        if (!appliquerPoidsNormal) {
            console.warn(`[ANTI-COLLUSION] Entraide répétée < 48h détectée entre ${requesterId} et ${mentorId}. Poids neutre appliqué.`);
        }

        const reqUserId = request.requesterId.toString();
        const dejaAide = metric.uniqueUsersHelped.some(id => id.toString() === reqUserId);
        if (!dejaAide) {
            metric.uniqueUsersHelped.push(request.requesterId);
        }

        if (appliquerPoidsNormal) {
            metric.helpCount += 1;
            metric.totalStars += rating;
        } else {
            metric.acceptedCount += 2; // Léger malus anti-spam
        }

        // Calcul du score de réputation via la formule mathématique
        metric.reputationScore = calculerScorePondere(metric);

        // Attribution d'XP et régénération de ticket
        mentor.xpPoints += appliquerPoidsNormal ? (50 + rating * 10) : 10;
        mentor.requestsLeft = Math.min(10, mentor.requestsLeft + 1);
        await mentor.save();

        request.status = 'completed';
        request.rating = rating;
        await request.save();

        return {
            appliquerPoidsNormal,
            newSkillReputation: metric.reputationScore,
            request
        };
    }
}

module.exports = RequestService;
