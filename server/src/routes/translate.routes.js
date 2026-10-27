const express = require('express');
const { body } = require('express-validator');
const TranslateController = require('../controllers/translate.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

// POST /api/translate — texte uniquement, 10kb max (app.js), low-data Afrique-first
router.post(
  '/',
  [
    body('text').isString().trim().isLength({ min: 1, max: 1000 }).withMessage('Texte 1-1000 caractères requis.'),
    body('targetLang').optional().isString().trim().isLength({ min: 2, max: 5 }),
    body('sourceLang').optional().isString().trim().isLength({ min: 2, max: 5 }),
    body('skillTag').optional().isString().trim().isLength({ max: 40 })
  ],
  validate,
  TranslateController.translate
);

module.exports = router;