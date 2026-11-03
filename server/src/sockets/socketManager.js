const { Server } = require('socket.io');
const ChatService = require('../services/chat.service');
const TranslateService = require('../services/translate.service');
const User = require('../models/User');
const Request = require('../models/Request');
const Muse = require('../services/muse.service');
const { contientContenuInterdit } = require('../utils/antiMarket');

const BLOCKED_TEXT = {
    fr: "Message bloqué : les paiements, ventes et demandes de faire les devoirs à la place d'un étudiant sont interdits sur Éco-Mentorat.",
    en: "Message blocked: payments, sales and requests to do someone's homework are not allowed on Eco-Mentorat.",
    ja: 'メッセージはブロックされました：支払い、販売、宿題の代行依頼はEco-Mentoratでは禁止されています。',
    zh: '消息已被拦截：Eco-Mentorat 禁止付费交易、销售以及代做作业的请求。',
    es: 'Mensaje bloqueado: los pagos, las ventas y las peticiones de hacer los deberes de otra persona están prohibidos en Eco-Mentorat.',
    ar: 'تم حظر الرسالة: المدفوعات والبيع وطلب حل الواجبات بدلاً من الطالب ممنوعة في Eco-Mentorat.',
    pt: 'Mensagem bloqueada: pagamentos, vendas e pedidos para fazer os trabalhos de outra pessoa são proibidos no Eco-Mentorat.'
};

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
            socket.on('join_room', ({ requestId, userId, username, lang }) => {
                if (!requestId) return;
                if (lang) socket.data.lang = TranslateService.normalizeLang(lang, null);
                socket.join(requestId.toString());
                console.log(`[SOCKET] ${username || userId} a rejoint le salon ${requestId}`);
            });

            // Réception Meta AI : persistance + traduction temps-réel (texte <1Ko, Afrique-first)
            socket.on('send_message', async ({ requestId, content, username, userId, time, sourceLang, targetLang }) => {
                try {
                    const senderId = userId || socket.data?.userId;
                    let senderHint = sourceLang || null;
                    try {
                        if (!senderHint && senderId) {
                            const senderDoc = await User.findById(senderId).select('preferredLang').lean();
                            if (senderDoc) senderHint = senderDoc.preferredLang;
                        }
                    } catch {}
                    const srcLang = TranslateService.detectLanguage
                        ? TranslateService.detectLanguage(content, senderHint || 'fr')
                        : TranslateService.normalizeLang(senderHint, 'fr');

                    // Modération du chat : filtre regex instantané + agent sémantique Meta (MARKET / CHEAT)
                    if (content) {
                        let blocked = contientContenuInterdit(content);
                        let reason = null;
                        if (!blocked && content.trim().length >= 12) {
                            try {
                                const reqTag = requestId ? await Request.findById(requestId).select('skillTag').lean() : null;
                                const mod = await Promise.race([
                                    Muse.sparkModerate(content, reqTag?.skillTag || 'general', srcLang),
                                    new Promise((resolve) => setTimeout(() => resolve(null), 3500))
                                ]);
                                if (mod && (mod.label === 'MARKET' || mod.label === 'CHEAT') && (mod.confidence ?? 1) >= 0.75) {
                                    blocked = true;
                                    reason = mod.reason || null;
                                }
                            } catch {}
                        }
                        if (blocked) {
                            const base = BLOCKED_TEXT[srcLang] || BLOCKED_TEXT.en;
                            socket.emit('message_error', { code: 'BLOCKED', message: reason ? `${base}\n${reason}` : base });
                            return;
                        }
                    }
                    let savedMsg = null;
                    let skillTag = 'general';

                    if (requestId && senderId) {
                        savedMsg = await ChatService.saveMessage({
                            requestId,
                            senderId,
                            senderUsername: username || 'Anonyme',
                            content,
                            type: 'text',
                            sourceLang: srcLang
                        });
                        try {
                            const reqDoc = await Request.findById(requestId).lean();
                            if (reqDoc) {
                                skillTag = reqDoc.skillTag || 'general';
                                // Détecte le receveur pour sa langue maternelle
                                let receiverId = null;
                                if (reqDoc.requesterId && reqDoc.requesterId.toString() !== senderId.toString()) receiverId = reqDoc.requesterId;
                                else if (reqDoc.mentorId && reqDoc.mentorId.toString() !== senderId.toString()) receiverId = reqDoc.mentorId;
                                let recvLang = TranslateService.normalizeLang(targetLang, null);
                                // Langue d'interface réellement choisie par le destinataire (connecté dans le salon)
                                if (!recvLang) {
                                    try {
                                        const peers = await this.io.in(requestId.toString()).fetchSockets();
                                        const peer = peers.find((p) => p.id !== socket.id && p.data?.lang);
                                        if (peer) recvLang = peer.data.lang;
                                    } catch {}
                                }
                                if (!recvLang && receiverId) {
                                    const recv = await User.findById(receiverId).select('preferredLang').lean();
                                    if (recv) recvLang = TranslateService.normalizeLang(recv.preferredLang, 'fr');
                                }
                                if (!recvLang) recvLang = srcLang === 'fr' ? 'ja' : 'fr';
                                if (recvLang !== srcLang && content) {
                                    const tr = await TranslateService.translateText(content, recvLang, { sourceLang: srcLang, skillTag });
                                    // Cache en base pour historique multilingue
                                    if (savedMsg) {
                                        savedMsg.translations = savedMsg.translations || new Map();
                                        savedMsg.translations.set(recvLang, tr.translated);
                                        savedMsg.sourceLang = srcLang;
                                        await savedMsg.save();
                                    }
                                    const payloadTime = time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                    // Émet version personnalisée au receveur
                                    socket.to(requestId.toString()).emit('receive_message', {
                                        id: savedMsg ? savedMsg._id : Date.now(),
                                        userId: senderId,
                                        content,
                                        content_translated: tr.translated,
                                        translated: tr.translated,
                                        sourceLang: srcLang,
                                        targetLang: recvLang,
                                        engine: tr.engine,
                                        poweredBy: 'Muse Spark (Meta Model API)',
                                        skillTag,
                                        type: 'text',
                                        isMe: false,
                                        username,
                                        time: payloadTime
                                    });
                                    // Écho à l'expéditeur avec traduction pour toggle Voir original
                                    socket.emit('message_sent', {
                                        id: savedMsg ? savedMsg._id : Date.now(),
                                        content,
                                        content_translated: tr.translated,
                                        sourceLang: srcLang,
                                        targetLang: recvLang,
                                        engine: tr.engine,
                                        time: payloadTime
                                    });
                                    return;
                                }
                            }
                        } catch (trErr) {
                            console.warn(`[SOCKET I18N] Fallback original : ${trErr.message}`);
                        }
                    }

                    // Fallback : diffusion originale (jamais bloquer le chat)
                    const payloadTime = time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    socket.to(requestId.toString()).emit('receive_message', {
                        id: savedMsg ? savedMsg._id : Date.now(),
                        userId: senderId,
                        content,
                        content_translated: null,
                        sourceLang: srcLang,
                        type: 'text',
                        isMe: false,
                        username,
                        time: payloadTime
                    });
                    socket.emit('message_sent', {
                        id: savedMsg ? savedMsg._id : Date.now(),
                        content,
                        content_translated: null,
                        sourceLang: srcLang,
                        type: 'text',
                        time: payloadTime
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

                    const payloadTime = time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    socket.to(requestId.toString()).emit('receive_file', {
                        id: savedMsg ? savedMsg._id : Date.now(),
                        content: fileName,
                        type: fileType,
                        url: fileUrl,
                        isMe: false,
                        username,
                        time: payloadTime
                    });
                    socket.emit('file_sent', {
                        id: savedMsg ? savedMsg._id : Date.now(),
                        content: fileName,
                        type: fileType,
                        url: fileUrl,
                        fileName,
                        time: payloadTime
                    });
                } catch (err) {
                    console.warn(`[SOCKET ERROR] Échec envoi fichier : ${err.message}`);
                    socket.emit('message_error', { message: err.message });
                }
            });

            // Notification de fin de session
            socket.on('session_completed', ({ requestId, newReputation, newSkillReputation, xpGained, rating, mentorId, newXpPoints, newRankTitle }) => {
                this.io.to(requestId.toString()).emit('session_ended', {
                    requestId,
                    message: "La session a été clôturée par l'apprenant.",
                    newSkillReputation: newSkillReputation || newReputation,
                    xpGained,
                    rating,
                    mentorId,
                    newXpPoints,
                    newRankTitle
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
        // P01-FIX temps réel Home : broadcast global pour que le feed JP/FR/BR se mette à jour sans refresh
        try {
          this.io.emit('feed_new_request', {
            id: newRequest._id,
            title: newRequest.title,
            description: newRequest.description,
            skillTag: tagStd,
            sourceLang: newRequest.sourceLang || 'fr',
            createdAt: newRequest.createdAt || new Date().toISOString(),
          });
        } catch {}
        return count;
    }

    broadcastFeedUpdate(type, payload = {}) {
        try { this.io.emit('feed_updated', { type, ...payload, at: new Date().toISOString() }); } catch {}
    }
}

module.exports = SocketManager;
