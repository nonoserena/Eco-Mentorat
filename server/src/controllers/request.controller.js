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
            const viewerLang = req.query.lang || req.user?.preferredLang || 'fr';
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
            const viewerLang = req.query.lang || req.user?.preferredLang || 'fr';
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
            const viewerLang = req.query.lang || req.user?.preferredLang || 'fr';
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
            const viewerLang = req.query.lang || req.user?.preferredLang || 'fr';
            const result = await RequestService.getHistory({ page, limit, viewerLang });
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const viewerLang = req.query.lang || req.user?.preferredLang || 'fr';
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
            const socketManager = req.app.get('socketManager');
            const result = await RequestService.completeRequest(requestId, requesterId, parseInt(rating));

            // Notifie en temps réel toute la room (apprenant et mentor)
            try {
                if (socketManager?.io) {
                    socketManager.io.to(requestId.toString()).emit('session_ended', {
                        requestId,
                        rating: parseInt(rating),
                        xpGained: result.xpGained,
                        newSkillReputation: result.newSkillReputation,
                        mentorId: result.mentorId?.toString(),
                        newXpPoints: result.newXpPoints,
                        newRankTitle: result.newRankTitle,
                        message: "La session a été clôturée par l'apprenant."
                    });
                }
            } catch (sockErr) {
                console.warn('[SOCKET] Échec notification session_ended:', sockErr.message);
            }

            res.status(200).json({
                status: 'success',
                message: result.appliquerPoidsNormal
                    ? 'Entraide validée avec succès !'
                    : 'Avis enregistré. Système anti-spam actif.',
                ...result
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Automatisation Meta Muse Spark : Auto-étiquetage et analyse de matière
     */
    static async autoTag(req, res, next) {
        try {
            const { title, description } = req.body;
            const Muse = require('../services/muse.service');
            const result = await Muse.sparkAutoTag(title, description || '');
            res.status(200).json({
                status: 'success',
                poweredBy: 'Meta Muse Spark',
                ...(result || { suggestedTag: '#general', confidence: 0.5, difficulty: 'Intermédiaire' })
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Automatisation Meta Muse Spark Vision : Scan et transcription d'une photo d'exercice
     */
    static async scanExercise(req, res, next) {
        try {
            const { imageBase64, mimeType } = req.body;
            if (!imageBase64) {
                return res.status(400).json({ status: 'fail', message: 'Image manquante.' });
            }
            const dataUrl = imageBase64.startsWith('data:')
                ? imageBase64
                : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
            const Muse = require('../services/muse.service');
            const userLang = req.user?.preferredLang || 'fr';
            const result = await Muse.sparkAnalyzeExercisePhoto(dataUrl, userLang);
            res.status(200).json({
                status: 'success',
                poweredBy: 'Meta SAM 3.1 + Muse Spark Vision',
                data: result || null
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Automatisation Meta Muse Voice Transcribe : Transcription vocale 2G -> demande structurée
     */
    static async voiceTranscribe(req, res, next) {
        try {
            const { audioBase64, rawTranscript, lang } = req.body;
            const Muse = require('../services/muse.service');
            const userLang = lang || req.user?.preferredLang || 'fr';
            const result = await Muse.voiceTranscribe(audioBase64 || null, userLang, rawTranscript || '');
            res.status(200).json({
                status: 'success',
                poweredBy: 'Meta Muse Voice Transcribe (muse-voice-transcribe-1.0)',
                data: result || { text: rawTranscript || '', model: 'muse-voice-transcribe-1.0' }
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = RequestController;
