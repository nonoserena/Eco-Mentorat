const mongoose = require('mongoose');
const { RANKS, XP_THRESHOLDS, TICKETS } = require('../config/constants');

// Sous-schéma : Métriques de compétences par matière
const SkillMetricSchema = new mongoose.Schema({
    skillTag: {
        type: String,
        required: true,
        trim: true
    },
    reputationScore: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    totalStars: {
        type: Number,
        default: 5
    },
    acceptedCount: {
        type: Number,
        default: 1
    },
    helpCount: {
        type: Number,
        default: 1
    },
    uniqueUsersHelped: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { _id: false });

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Le nom d'utilisateur est obligatoire."],
        unique: true,
        trim: true,
        minlength: [3, 'Le nom doit contenir au moins 3 caractères.'],
        maxlength: [30, 'Le nom ne peut pas dépasser 30 caractères.']
    },
    email: {
        type: String,
        required: [true, "L'email est obligatoire."],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Format email invalide.']
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire."],
        select: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isIncognito: {
        type: Boolean,
        default: false
    },
    xpPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    rankTitle: {
        type: String,
        default: RANKS.NOVICE
    },
    // Système de limitation d'aide circulaire (anti-passager clandestin)
    requestsLeft: {
        type: Number,
        default: TICKETS.DEFAULT_QUOTA,
        min: 0,
        max: TICKETS.DEFAULT_QUOTA
    },
    lastReset: {
        type: Date,
        default: Date.now
    },
    warningCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    skillsDeclarated: [{
        type: String,
        trim: true
    }],
    skillsMetrics: [SkillMetricSchema]
}, {
    timestamps: true
});

// Index pour les performances
UserSchema.index({ xpPoints: -1 });
UserSchema.index({ skillsDeclarated: 1 });

// Middleware Mongoose v9 asynchrone pour la progression de grade
UserSchema.pre('save', async function() {
    const xp = this.xpPoints;
    for (const threshold of XP_THRESHOLDS) {
        if (xp >= threshold.minXP) {
            this.rankTitle = threshold.rank;
            break;
        }
    }
});

module.exports = mongoose.model('User', UserSchema);
