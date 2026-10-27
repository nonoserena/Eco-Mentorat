const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: [true, "L'ID de la demande est obligatoire."],
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'ID de l'expéditeur est obligatoire."],
        index: true
    },
    senderUsername: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: [true, "Le contenu du message est obligatoire."],
        trim: true,
        maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères.']
    },
    sourceLang: {
        type: String,
        default: 'fr',
        trim: true,
        lowercase: true
    },
    translations: {
        type: Map,
        of: String,
        default: {}
    },
    type: {
        type: String,
        enum: ['text', 'image', 'pdf', 'system'],
        default: 'text'
    },
    fileUrl: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index pour recharger la conversation chronologiquement
MessageSchema.index({ requestId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
