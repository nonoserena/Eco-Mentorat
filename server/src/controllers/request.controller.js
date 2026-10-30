const RequestService = require('../services/request.service');

class RequestController {
    static async create(req, res, next) {
        try {
            const { title, description, skillTag } = req.body;
            const requesterId = req.user.id;
            const socketManager = req.app.get('socketManager');

            const result = await RequestService.createRequest(
                { requesterId, title, description, skillTag },
                socketManager
            );

            try { socketManager?.broadcastFeedUpdate?.('created', { id: result?.request?._id }); } catch {}

            res.status(201).json({
                status: 'success',
                message: 'Demande publiée avec succès !',
                ...result
            });
        } catch (err) {
            next(err);
        }
    }

    static async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const viewerLang = req.user?.preferredLang || req.query.lang || 'fr';
            const result = await RequestService.getAllRequests({ page, limit, viewerLang });
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async getMyRequests(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const viewerLang = req.user?.preferredLang || req.query.lang || 'fr';
            const result = await RequestService.getMyRequests(req.user.id, { page, limit, viewerLang });
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async getMyHelps(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const viewerLang = req.user?.preferredLang || req.query.lang || 'fr';
            const result = await RequestService.getMyHelps(req.user.id, { page, limit, viewerLang });
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async getHistory(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const viewerLang = req.user?.preferredLang || req.query.lang || 'fr';
            const result = await RequestService.getHistory({ page, limit, viewerLang });
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const viewerLang = req.user?.preferredLang || req.query.lang || 'fr';
            const request = await RequestService.getRequestById(req.params.id, viewerLang);
            res.status(200).json({ request });
        } catch (err) {
            next(err);
        }
    }

    static async accept(req, res, next) {
        try {
            const { requestId } = req.body;
            const mentorId = req.user.id;
            const result = await RequestService.acceptRequest(requestId, mentorId);
            res.status(200).json({
                message: "Session d'entraide initialisée. Le chat privé est ouvert.",
                ...result
            });
        } catch (err) {
            next(err);
        }
    }

    static async replace(req, res, next) {
        try {
            const { requestId } = req.body;
            const requesterId = req.user.id;
            const request = await RequestService.replaceMentor(requestId, requesterId);
            res.status(200).json({
                message: 'Mentor remplacé. La demande est de nouveau ouverte.',
                requestId: request._id
            });
        } catch (err) {
            next(err);
        }
    }

    static async complete(req, res, next) {
        try {
            const { requestId, rating } = req.body;
            const requesterId = req.user.id;
            const result = await RequestService.completeRequest(requestId, requesterId, parseInt(rating));
            res.status(200).json({
                message: result.appliquerPoidsNormal
                    ? 'Entraide validée avec succès !'
                    : 'Avis enregistré. Système anti-spam actif.',
                newSkillReputation: result.newSkillReputation
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = RequestController;
