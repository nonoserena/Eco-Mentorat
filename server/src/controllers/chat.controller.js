const ChatService = require('../services/chat.service');

class ChatController {
    /**
     * Envoie et sauvegarde un message (REST fallback ou appel direct)
     */
    static async sendMessage(req, res, next) {
        try {
            const { requestId, content, type, fileUrl, fileName } = req.body;
            const senderId = req.user.id;
            const senderUsername = req.user.username;

            // Si requestId n'est pas fourni dans le body, on prend celui transmis
            if (!requestId) {
                // Pour compatibilité avec l'ancien frontend qui appelait /api/chat/message sans requestId
                // On valide le contenu anti-marché
                const { contientContenuInterdit } = require('../utils/antiMarket');
                if (contientContenuInterdit(content)) {
                    return res.status(400).json({
                        message: '⚠️ Action bloquée. Les demandes de transactions financières sont interdites.'
                    });
                }
                return res.status(201).json({ message: 'Message validé avec succès.' });
            }

            const savedMessage = await ChatService.saveMessage({
                requestId,
                senderId,
                senderUsername,
                content,
                type,
                fileUrl,
                fileName
            });

            res.status(201).json({
                status: 'success',
                message: 'Message validé et enregistré avec succès.',
                data: savedMessage
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Récupère l'historique complet d'une conversation
     */
    static async getHistory(req, res, next) {
        try {
            const { requestId } = req.params;
            const messages = await ChatService.getMessageHistory(requestId, req.user.id, req.query.lang || null);
            res.status(200).json({
                status: 'success',
                results: messages.length,
                messages
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ChatController;
