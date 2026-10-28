const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.post(
    '/register',
    authLimiter,
    [
        body('username').trim().notEmpty().withMessage("Le nom d'utilisateur est requis.").isLength({ max: 30 }),
        body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
        body('password').isLength({ min: 8 }).withMessage('Mot de passe trop court (8 caractères min).'),
        body('skillsDeclarated').optional().isArray(),
        body('preferredLang').optional().isString().trim().isLength({ min: 2, max: 5 }),
        body('country').optional().isString().trim().isLength({ min: 2, max: 2 })
    ],
    validate,
    AuthController.register
);

router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
        body('password').notEmpty().withMessage('Mot de passe requis.')
    ],
    validate,
    AuthController.login
);

module.exports = router;
