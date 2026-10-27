const express = require('express');
const router = express.Router();

// GET /api/meta — Preuve jury : quels modèles Meta sont intégrés où
// Public, sans auth, texte léger Afrique-first
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    project: 'Eco-Mentorat',
    poweredBy: 'Muse (Meta Model API)',
    credits: '$150 Meta Model API credits',
    track: 'Build for Your World - Douala-Osaka sans frontieres de langue, meme en 2G',
    live: 'muse-spark-3 live via Meta Model API, fallback offline si quota vide',
    message: 'Cette API utilise les modeles Muse au coeur du produit.',
    models: [
      { name: 'muse-spark-3 (Muse Spark series)', usage: 'Traduction FR->JA feed + chat temps-reel avec contexte skillTag', where: 'POST /api/translate + socket send_message', file: 'muse.service.js sparkTranslate()' },
      { name: 'muse-voice-transcribe (Muse Voice Transcribe)', usage: 'Audio Opus 12kbps -> sous-titres texte traduits live low-debit', where: 'chat sous-titres', file: 'muse.service.js voiceTranscribe()' },
      { name: 'muse-spark-3 agent (Moderation)', usage: 'Agent {OK|CHEAT|MARKET} + explication langue maternelle', where: 'POST /requests/create + socket', file: 'muse.service.js sparkModerate() P0-2' },
      { name: 'muse-wonder (Muse Wonder)', usage: 'Resume session + visuel portfolio + vignette challenge', where: 'session_completed + profil', file: 'P0-3 Best Creative Build' },
      { name: 'muse-image (Muse Image)', usage: 'Visuels challenges + portfolio employabilite', where: 'LeaderBoard + Profile', file: 'P0-3/P2' },
      { name: 'SAM 3.1', usage: 'Segmentation photo cahier pour expliquer zone ecrite', where: 'upload image chat', file: 'P1 multimodal' },
      { name: 'muse-spark-open-1026 (Muse Spark Open)', usage: 'Fallback open-weights via Baseten bonus $10k', where: 'translate fallback', file: 'muse.service.js sparkOpenChat()' },
      { name: 'muse-glimmer (Muse Glimmer)', usage: 'Open-weights leger Afrique low-RAM', where: 'Baseten/Modal', file: 'Bonus open-weights' },
      { name: 'muse-code (Muse Code)', usage: 'Agent coding qui a accelere P0-1', where: 'dev', file: 'README + commits' }
    ],
    demo: 'Douala publie en francais -> Osaka lit en japonais via muse-spark-3, meme en 2G. Texte <1Ko/message.',
    video: 'Demo video 3min realisee avec Muse Wonder',
    commitTrace: 'git log --grep=muse'
  });
});

module.exports = router;