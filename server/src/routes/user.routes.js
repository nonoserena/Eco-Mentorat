const express = require('express');
const { param, query } = require('express-validator');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// 1. Profil public accessible sans authentification (pour CV et recruteurs)
router.get(
    '/public/:username',
    [
        param('username').trim().notEmpty().withMessage("Nom d'utilisateur requis.")
    ],
    validate,
    UserController.getPublicProfile
);

// Les routes ci-dessous nécessitent une authentification
router.use(authMiddleware);

// 2. Leaderboard
router.get(
    '/leaderboard',
    [
        query('skill').optional().isString().trim()
    ],
    validate,
    UserController.getLeaderboard
);

// 3. Mon profil frais
router.get('/me', UserController.getMyProfile);

// 4. Portfolio PDF certifié
router.get(
    '/:id/portfolio',
    [
        param('id').isMongoId().withMessage('ID utilisateur invalide.')
    ],
    validate,
    UserController.getPortfolio
);

module.exports = router;
