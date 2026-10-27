const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { nettoyerEtRegrouperTag } = require('../utils/tagNormalizer');

class AuthService {
    static generateToken(user) {
        return jwt.sign(
            { id: user._id, username: user.username, email: user.email, preferredLang: user.preferredLang || 'fr' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    static async register({ username, email, password, skillsDeclarated, preferredLang }) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Cet email est déjà associé à un compte.', 409);
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            throw new AppError("Ce nom d'utilisateur est déjà utilisé.", 409);
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const metricsInitiales = [];
        const skillsNormalises = [];

        if (Array.isArray(skillsDeclarated)) {
            skillsDeclarated.forEach(tag => {
                const tagStd = nettoyerEtRegrouperTag(tag);
                if (!skillsNormalises.includes(tagStd)) {
                    skillsNormalises.push(tagStd);
                    metricsInitiales.push({
                        skillTag: tagStd,
                        reputationScore: 5.0,
                        totalStars: 5,
                        acceptedCount: 1,
                        helpCount: 1,
                        uniqueUsersHelped: []
                    });
                }
            });
        }

        const langNorm = ['fr', 'en', 'ja', 'zh', 'wo', 'es', 'ar'].includes(String(preferredLang || '').toLowerCase()) ? String(preferredLang).toLowerCase() : 'fr';
        const newUser = new User({
            username,
            email,
            password: passwordHash,
            preferredLang: langNorm,
            skillsDeclarated: skillsNormalises,
            skillsMetrics: metricsInitiales
        });

        await newUser.save();
        const token = this.generateToken(newUser);

        return {
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                preferredLang: newUser.preferredLang,
                xpPoints: newUser.xpPoints,
                rankTitle: newUser.rankTitle,
                skillsDeclarated: newUser.skillsDeclarated
            },
            token
        };
    }

    static async login({ email, password }) {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError('Identifiants incorrects.', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Identifiants incorrects.', 401);
        }

        user.lastLogin = new Date();
        await user.save();

        const token = this.generateToken(user);

        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                preferredLang: user.preferredLang || 'fr',
                xpPoints: user.xpPoints,
                rankTitle: user.rankTitle,
                skillsDeclarated: user.skillsDeclarated
            },
            token
        };
    }
}

module.exports = AuthService;
