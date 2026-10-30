# Éco-Mentorat — Meta Global AI Developer Hackathon Submission

**Track :** Build for Your World  
**Tagline :** Peer-to-peer academic mentoring without language barriers (Douala ↔ Osaka), powered by a multi-model Meta AI agentic pipeline optimized for 2G networks.

---

## 1. What Was Built During the Hackathon (Oct 27 – Nov 4)

During the Meta Global AI Developer Hackathon, we built and integrated the **Meta AI Multi-Model Agentic Layer** at the core of Éco-Mentorat, transforming a local student help board into a cross-border, multimodal, self-moderating mentoring network across **8 languages** (`FR`, `JA`, `AR`, `PT`, `EN`, `ES`, `WO`, `ZH`).

### The 6 Meta Models Integrated in Production (`server/src/services/muse.service.js`)

| # | Meta Model | Role in Éco-Mentorat | Endpoint / Trigger | Source File |
|---|---|---|---|---|
| **1** | **`muse-spark-1.3`** *(Muse Spark series)* | Real-time pedagogical translation (`FR ↔ JA/EN/AR/PT/ES/WO/ZH`) preserving subject-specific terminology (`skillTag`) in `<1 KB` payloads for 2G networks. | `POST /api/translate` & WebSocket `send_message` | [`server/src/services/muse.service.js`](server/src/services/muse.service.js) (`sparkTranslate`) |
| **2** | **`meta-models/muse-spark-open-1026`** *(Muse Spark Open — Open-Weights)* | Autonomous moderation agent returning structured JSON `{"label": "OK\|MARKET\|CHEAT", "confidence": 0-1, "reason": "..."}` in the student's native language to block marketplace spam and exam cheating. | `POST /api/requests/create` & WebSocket `saveMessage` | [`server/src/services/muse.service.js`](server/src/services/muse.service.js) (`sparkModerate` + `sparkOpenChat`) |
| **3** | **`muse-glimmer-1.0`** *(Muse Glimmer — Lightweight Open-Weights)* | Low-latency academic routing & auto-tagging agent that classifies student questions into subjects (`#python`, `#java`, `#reseau`, `#mathematiques`...) and difficulty levels (`Débutant`, `Intermédiaire`, `Avancé`). | `POST /api/requests/auto-tag` | [`server/src/services/muse.service.js`](server/src/services/muse.service.js) (`sparkAutoTag`) |
| **4** | **`sam-3.1` + `muse-spark-1.3` Vision** *(2-Stage Multimodal Pipeline)* | **SAM 3.1** isolates the problem statement region on a student's notebook photo, then **Muse Spark Vision** transcribes and structures the exercise into a ready-to-publish help request. | `POST /api/requests/scan-exercise` | [`server/src/services/muse.service.js`](server/src/services/muse.service.js) (`samSegmentExercise` + `sparkAnalyzeExercisePhoto`) |
| **5** | **`muse-voice-transcribe-1.0`** *(Muse Voice Transcribe)* | Low-bandwidth voice dictation allowing students on mobile/2G to speak their problem and have it transcribed, punctuated, and structured automatically. | `POST /api/requests/voice-transcribe` | [`server/src/services/muse.service.js`](server/src/services/muse.service.js) (`voiceTranscribe`) |
| **6** | **`muse-wonder-1.0` & `muse-image-1.0`** *(Muse Wonder / Image)* | Analyzes the full mentoring transcript upon session closure to generate a 2-sentence pedagogical summary and certify the exact skill demonstrated on the mentor's employability portfolio. | `POST /api/requests/complete` | [`server/src/services/muse.service.js`](server/src/services/muse.service.js) (`sparkSummarizeSession` + `wonderGenerate`) |

---

## 2. Live Jury Verification Endpoint

Judges can inspect the active Meta multi-model configuration at any time via:
```bash
GET /api/meta
```
Implemented in [`server/src/routes/meta.routes.js`](server/src/routes/meta.routes.js).

---

## 3. Key Files Created / Upgraded During the Hackathon

- [`server/src/services/muse.service.js`](server/src/services/muse.service.js) — Multi-model orchestrator (`muse-spark-1.3`, `muse-spark-open-1026`, `muse-glimmer-1.0`, `sam-3.1`, `muse-voice-transcribe-1.0`, `muse-wonder-1.0`, `muse-image-1.0`).
- [`server/src/services/translate.service.js`](server/src/services/translate.service.js) — Subject-aware translation pipeline with Redis/MongoDB caching and offline fallback for 2G resilience.
- [`server/src/routes/meta.routes.js`](server/src/routes/meta.routes.js) — Public verification manifest of Meta models used.
- [`client/src/pages/dashboard/CreateRequest.jsx`](client/src/pages/dashboard/CreateRequest.jsx) — Multimodal request creation UI with **SAM 3.1 + Vision Exercise Scanner**, **Muse Voice Transcribe dictation**, and **Muse Glimmer Auto-Tagging**.
- [`client/src/pages/chat/Chat.jsx`](client/src/pages/chat/Chat.jsx) — Real-time cross-language mentoring room with instant translation toggle (`See original` / `See translation`) powered by **Meta Muse Spark**.
- [`client/src/i18n/`](client/src/i18n/) — Full 8-language internationalization (`FR`, `EN`, `JA`, `AR`, `PT`, `ES`, `WO`, `ZH`) with RTL support.
