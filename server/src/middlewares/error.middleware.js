/**
 * Middleware centralisé de traitement des erreurs (Clean Architecture)
 */

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log côté serveur
    if (err.statusCode === 500) {
        console.error('[ERREUR CRITIQUE INTERNE]', err);
    } else {
        console.warn(`[REQUÊTE REJETÉE] ${req.method} ${req.originalUrl} - ${err.message}`);
    }

    // Gestion des erreurs Mongoose courantes
    if (err.name === 'CastError') {
        err.statusCode = 400;
        err.message = `Identifiant invalide : ${err.value}`;
    }
    if (err.code === 11000) {
        err.statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        err.message = `Cette valeur existe déjà pour le champ : ${field}`;
    }

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
