const { Server } = require('socket.io');
const ChatService = require('../services/chat.service');

class SocketManager {
    constructor(httpServer, corsOptions) {
        this.io = new Server(httpServer, {
            cors: corsOptions,
            transports: ['websocket', 'polling']
        });
        this.userSockets = new Map(); // Cache local : userId -> socketId

        this.init();
    }

    init() {
        this.io.on('connection', (socket) => {
            console.log(`[SOCKET] Connexion client établie : ${socket.id}`);

            // Enregistrement d'un utilisateur connecté
            socket.on('register_user', ({ userId }) => {
                if (!userId) return;

                // Nettoyage de socket antérieur si nécessaire
                this.userSockets.forEach((sId, uId) => {
                    if (sId === socket.id) this.userSockets.delete(uId);
                });

                this.userSockets.set(userId.toString(), socket.id);
                socket.join(`user_${userId}`);
                console.log(`[SOCKET] Utilisateur ${userId} enregistré dans sa room. Actifs: ${this.userSockets.size}`);
            });

            // Rejoindre le salon privé d'une demande
            socket.on('join_room', ({ requestId, userId, username }) => {
                if (!requestId) return;
                socket.join(requestId.toString());
                console.log(`[SOCKET] ${username || userId} a rejoint le salon ${requestId}`);
            });

            // Réception et persistance d'un message texte
            socket.on('send_message', async ({ requestId, content, username, userId, time }) => {
                try {
                    // Sauvegarde robuste dans la base de données MongoDB
                    const senderId = userId || socket.data?.userId;
                    let savedMsg = null;

                    if (requestId && senderId) {
                        savedMsg = await ChatService.saveMessage({
                            requestId,
                            senderId,
                            senderUsername: username || 'Anonyme',
                            content,
                            type: 'text'
                        });
                    }

                    // Diffusion temps réel dans la room
                    socket.to(requestId.toString()).emit('receive_message', {
                        id: savedMsg ? savedMsg._id : Date.now(),
                        content,
                        type: 'text',
                        isMe: false,
                        username,
                        time: time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    });
                } catch (err) {
                    console.warn(`[SOCKET ERROR] Échec envoi message : ${err.message}`);
                    socket.emit('message_error', { message: err.message });
                }
            });

            // Réception et persistance d'un fichier partagé
            socket.on('send_file', async ({ requestId, fileName, fileType, fileUrl, username, userId, time }) => {
                try {
                    const senderId = userId || socket.data?.userId;
                    let savedMsg = null;

                    if (requestId && senderId) {
                        savedMsg = await ChatService.saveMessage({
                            requestId,
                            senderId,
                            senderUsername: username || 'Anonyme',
                            content: fileName,
                            type: fileType && fileType.includes('pdf') ? 'pdf' : 'image',
                            fileUrl,
                            fileName
                        });
                    }

                    socket.to(requestId.toString()).emit('receive_file', {
                        id: savedMsg ? savedMsg._id : Date.now(),
                        content: fileName,
                        type: fileType,
                        url: fileUrl,
                        isMe: false,
                        username,
                        time: time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    });
                } catch (err) {
                    console.warn(`[SOCKET ERROR] Échec envoi fichier : ${err.message}`);
                    socket.emit('message_error', { message: err.message });
                }
            });

            // Notification de fin de session
            socket.on('session_completed', ({ requestId, newReputation }) => {
                socket.to(requestId.toString()).emit('session_ended', {
                    message: "La session a été clôturée par l'apprenant.",
                    newReputation
                });
                console.log(`[SOCKET] Session ${requestId} clôturée.`);
            });

            // Déconnexion
            socket.on('disconnect', () => {
                this.userSockets.forEach((sId, uId) => {
                    if (sId === socket.id) {
                        this.userSockets.delete(uId);
                        console.log(`[SOCKET] Utilisateur ${uId} déconnecté.`);
                    }
                });
            });
        });
    }

    /**
     * Notifie les mentors qualifiés connectés d'une nouvelle demande
     */
    notifyMentors(mentors, newRequest, tagStd) {
        let count = 0;
        mentors.forEach(mentor => {
            const mentorId = mentor._id.toString();
            const roomName = `user_${mentorId}`;
            const isConnected = this.userSockets.has(mentorId);

            this.io.to(roomName).emit('new_request', {
                id: newRequest._id,
                title: newRequest.title,
                skillTag: tagStd,
                message: `🔔 Nouvelle demande d'aide en ${tagStd} !`
            });

            if (isConnected) count++;
        });
        return count;
    }
}

module.exports = SocketManager;
