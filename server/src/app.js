const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const { generalLimiter } = require('./middlewares/rateLimiter.middleware');
const AppError = require('./errors/AppError');
const { CLIENT_URL } = require('./config/env');

const app = express();

// 1. Sécurité des en-têtes HTTP (OWASP)
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
app.use(cors({
    origin: true,
    credentials: true
}));

// 3. Limitation de taille du corps de requête (anti-DDoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Journalisation des accès
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// 5. Route Santé
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Éco-Mentorat API Enterprise opérationnelle.',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// 6. Application du limiteur général et des routes API
app.use('/api', generalLimiter, apiRoutes);

// 7. Capture des routes inconnues 404
app.use((req, res, next) => {
    next(new AppError(`Route introuvable sur ce serveur : ${req.method} ${req.originalUrl}`, 404));
});

// 8. Gestionnaire d'erreurs centralisé
app.use(errorHandler);

module.exports = app;
