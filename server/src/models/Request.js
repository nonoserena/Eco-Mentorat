const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'ID du demandeur est obligatoire."],
        index: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },
    replacedMentors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    title: {
        type: String,
        required: [true, "Le titre est obligatoire."],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères.']
    },
    description: {
        type: String,
        required: [true, "La description est obligatoire."],
        trim: true,
        maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères.']
    },
    skillTag: {
        type: String,
        required: [true, "Le tag de compétence est obligatoire."],
        trim: true,
        index: true
    },
    sourceLang: {
        type: String,
        default: 'fr',
        trim: true,
        lowercase: true
    },
    titleTranslations: {
        type: Map,
        of: String,
        default: {}
    },
    descriptionTranslations: {
        type: Map,
        of: String,
        default: {}
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'contested'],
        default: 'open',
        index: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    isContested: {
        type: Boolean,
        default: false
    },
    contestReason: {
        type: String,
        default: null,
        maxlength: [500, 'La raison ne peut pas dépasser 500 caractères.']
    },
    aiSummary: {
        type: String,
        default: null
    },
    verifiedSkill: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index combinés pour les requêtes courantes
RequestSchema.index({ status: 1, createdAt: -1 });
RequestSchema.index({ skillTag: 1, status: 1 });

module.exports = mongoose.model('Request', RequestSchema);
