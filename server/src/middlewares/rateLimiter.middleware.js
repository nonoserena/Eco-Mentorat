const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    }
});

const generalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Trop de requêtes. Veuillez ralentir.'
    }
});

module.exports = {
    authLimiter,
    generalLimiter
};
