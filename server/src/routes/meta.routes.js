const express = require('express');
const router = express.Router();

// GET /api/meta — Preuve jury : quels modèles Meta sont intégrés où
// Public, sans auth, texte léger Afrique-first
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    project: 'Eco-Mentorat',
    poweredBy: 'Meta Model API + Meta Open-Weights',
    credits: '$150 Meta Model API credits + Baseten Open-Weights',
    track: 'Build for Your World - Douala-Osaka sans frontieres de langue, meme en 2G',
    live: 'Orchestration multi-modeles Meta active (Spark 1.3, Spark Open 1026, Glimmer, SAM 3.1, Voice Transcribe 1.0, Wonder 1.0)',
    message: 'Cette API orchestre 6 modeles de l\'ecosysteme Meta au coeur du parcours d\'entraide etudiante.',
    models: [
      {
        name: 'muse-spark-1.3 (Muse Spark series)',
        usage: 'Traduction pédagogique FR <-> JA / EN / AR / PT / ES / WO / ZH en temps réel avec contexte matière (skillTag)',
        where: 'POST /api/translate + socket send_message',
        file: 'muse.service.js (sparkTranslate)'
      },
      {
        name: 'meta-models/muse-spark-open-1026 (Muse Spark Open — Open-Weights)',
        usage: 'Agent de modération autonome {OK|CHEAT|MARKET} avec motif expliqué dans la langue de l\'étudiant',
        where: 'POST /api/requests/create + chat saveMessage',
        file: 'muse.service.js (sparkModerate + sparkOpenChat)'
      },
      {
        name: 'muse-glimmer-1.0 (Muse Glimmer — Lightweight Open-Weights)',
        usage: 'Agent d\'orientation académique basse latence 2G : déduit la matière (#python, #java, #reseau...) et le niveau de difficulté',
        where: 'POST /api/requests/auto-tag',
        file: 'muse.service.js (sparkAutoTag)'
      },
      {
        name: 'sam-3.1 + muse-spark-1.3 Vision (Pipeline Multimodal 2 étapes)',
        usage: 'SAM 3.1 isole la zone d\'énoncé sur la photo du cahier, puis Muse Spark Vision transcrit et structure la demande',
        where: 'POST /api/requests/scan-exercise',
        file: 'muse.service.js (samSegmentExercise + sparkAnalyzeExercisePhoto)'
      },
      {
        name: 'muse-voice-transcribe-1.0 (Muse Voice Transcribe)',
        usage: 'Transcription vocale basse bande passante 2G -> formulation écrite structurée et traduite',
        where: 'POST /api/requests/voice-transcribe',
        file: 'muse.service.js (voiceTranscribe)'
      },
      {
        name: 'muse-wonder-1.0 & muse-image-1.0 (Muse Wonder / Image)',
        usage: 'Synthèse certifiante de fin de session et génération de compétence vérifiée pour le portfolio d\'employabilité du mentor',
        where: 'POST /api/requests/complete',
        file: 'muse.service.js (sparkSummarizeSession + wonderGenerate)'
      }
    ],
    demo: 'Douala publie (photo/voix/texte en français) -> SAM 3.1 + Glimmer + Spark Open traitent et modèrent -> Osaka lit en japonais via Muse Spark 1.3 -> Certificat Muse Wonder.',
    commitTrace: 'git log --grep=meta'
  });
});

module.exports = router;
