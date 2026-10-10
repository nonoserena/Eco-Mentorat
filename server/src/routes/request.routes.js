const express = require('express');
const { body, param, query } = require('express-validator');
const RequestController = require('../controllers/request.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Toutes les routes de demandes nécessitent une authentification
router.use(authMiddleware);

// 1. Publication d'une demande
router.post(
    '/create',
    [
        body('title').trim().notEmpty().isLength({ max: 100 }).withMessage('Titre obligatoire (100 car. max).'),
        body('description').trim().notEmpty().isLength({ max: 1000 }).withMessage('Description obligatoire (1000 car. max).'),
        body('skillTag').trim().notEmpty().withMessage('Tag de compétence obligatoire.')
    ],
    validate,
    RequestController.create
);

// 2. Toutes les demandes ouvertes
router.get(
    '/all',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 })
    ],
    validate,
    RequestController.getAll
);

// 3. Mes demandes créées (AVANT /:id)
router.get(
    '/my-requests',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 })
    ],
    validate,
    RequestController.getMyRequests
);

// 4. Mes aides en tant que mentor (AVANT /:id)
router.get(
    '/my-helps',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 })
    ],
    validate,
    RequestController.getMyHelps
);

// 5. Historique général (AVANT /:id)
router.get(
    '/history',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 })
    ],
    validate,
    RequestController.getHistory
);

// 6. Actions sur les demandes
router.post(
    '/accept',
    [
        body('requestId').isMongoId().withMessage('ID de demande invalide.')
    ],
    validate,
    RequestController.accept
);

router.post(
    '/replace-mentor',
    [
        body('requestId').isMongoId().withMessage('ID de demande invalide.')
    ],
    validate,
    RequestController.replace
);

router.post(
    '/complete',
    [
        body('requestId').isMongoId().withMessage('ID de demande invalide.'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être comprise entre 1 et 5.')
    ],
    validate,
    RequestController.complete
);

// 7. Demande par identifiant (EN DERNIER)
router.get(
    '/:id',
    [
        param('id').isMongoId().withMessage('ID de demande invalide.')
    ],
    validate,
    RequestController.getById
);

module.exports = router;
