const express = require('express');
const { body, param } = require('express-validator');
const ChatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// Validation et envoi d'un message
router.post(
    '/message',
    [
        body('content').optional().isString().trim().isLength({ max: 1000 })
    ],
    validate,
    ChatController.sendMessage
);

// Récupération de l'historique complet d'une session
router.get(
    '/:requestId/history',
    [
        param('requestId').isMongoId().withMessage('ID de demande invalide.')
    ],
    validate,
    ChatController.getHistory
);

module.exports = router;
