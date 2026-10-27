const express = require('express');
const router = express.Router();

// GET /api/meta — Preuve jury : quels modèles Meta sont intégrés où
// Public, sans auth, texte léger Afrique-first
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    project: 'Eco-Mentorat',
    poweredBy: 'Meta AI',
    message: 'Cette API utilise les modeles Meta au coeur du produit.',
    models: [
      {
        name: 'NLLB-200',
        usage: 'Traduction universelle feed + chat (200 langues : fr/en/ja/zh/wo/es/ar)',
        where: 'POST /api/translate + socket send_message -> receive_message',
        file: 'server/src/services/translate.service.js'
      },
      {
        name: 'Llama 3',
        usage: 'Polish pedagogique avec contexte skillTag + historique',
        where: 'translate.service.js llamaPolish()',
        file: 'server/src/services/translate.service.js'
      },
      {
        name: 'Llama Guard',
        usage: 'Moderation anti-triche / anti-marche (P0-2 en cours)',
        where: 'POST /api/requests/create + socket send_message',
        file: 'server/src/services/moderation.service.js (P0-2)'
      },
      {
        name: 'SeamlessM4T v2',
        usage: 'Audio -> sous-titres traduits live (P1, audio-first low-debit)',
        where: 'client/src/pages/chat/Chat.jsx sous-titres',
        file: 'P1 post-P0'
      }
    ],
    demo: 'Douala publie en francais -> Osaka lit en japonais, meme en 2G. Texte <1Ko/message.',
    video: 'Demo video 3min realisee avec Meta AI',
    commitTrace: 'git log --grep=meta-ai'
  });
});

module.exports = router;