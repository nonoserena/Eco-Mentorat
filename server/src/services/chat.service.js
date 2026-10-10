const Message = require('../models/Message');
const Request = require('../models/Request');
const AppError = require('../errors/AppError');
const { contientContenuInterdit } = require('../utils/antiMarket');

class ChatService {
    /**
     * Sauvegarde un message de chat avec validation anti-marché
     */
    static async saveMessage({ requestId, senderId, senderUsername, content, type = 'text', fileUrl = null, fileName = null }) {
        if (!content && !fileUrl) {
            throw new AppError('Le message ou le fichier ne peut pas être vide.', 400);
        }

        // Vérification anti-marché sur le contenu textuel
        if (content && contientContenuInterdit(content)) {
            throw new AppError('Action bloquée. Les demandes de transactions financières sont interdites.', 400);
        }

        const request = await Request.findById(requestId);
        if (!request) {
            throw new AppError('Demande introuvable.', 404);
        }

        // Vérification que l'utilisateur fait bien partie de la session
        const isParticipant = 
            request.requesterId.toString() === senderId.toString() ||
            (request.mentorId && request.mentorId.toString() === senderId.toString());

        if (!isParticipant) {
            throw new AppError("Vous n'êtes pas autorisé à envoyer des messages dans cette session.", 403);
        }

        const message = new Message({
            requestId,
            senderId,
            senderUsername,
            content: content || fileName || 'Fichier partagé',
            type,
            fileUrl,
            fileName
        });

        await message.save();
        return message;
    }

    /**
     * Récupère l'historique complet d'une conversation
     */
    static async getMessageHistory(requestId, userId) {
        const request = await Request.findById(requestId);
        if (!request) {
            throw new AppError('Demande introuvable.', 404);
        }

        const isParticipant = 
            request.requesterId.toString() === userId.toString() ||
            (request.mentorId && request.mentorId.toString() === userId.toString());

        if (!isParticipant) {
            throw new AppError("Vous n'êtes pas autorisé à consulter cette discussion.", 403);
        }

        const messages = await Message.find({ requestId })
            .sort({ createdAt: 1 })
            .lean();

        return messages;
    }
}

module.exports = ChatService;
