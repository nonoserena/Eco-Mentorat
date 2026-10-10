const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const AppError = require('../errors/AppError');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Accès refusé. Token d’authentification manquant.', 401));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError('Token invalide ou expiré.', 401));
    }
};

module.exports = authMiddleware;
