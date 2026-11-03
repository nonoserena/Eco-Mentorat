# Éco-Mentorat — Meta Global AI Developer Hackathon Submission

**Track :** Build for Your World  
**Tagline :** Peer-to-peer academic mentoring without language barriers (Douala ↔ Osaka), powered by a multi-model Meta AI agentic pipeline optimized for 2G networks.

---

## 0. Pre-existing Baseline vs. Built During the Hackathon

The repository history is public and lets judges verify what is original to the event (building period: Oct 27 – Nov 4).

| | Date | Commit | Content |
|---|---|---|---|
| **Baseline (before the hackathon)** | Oct 10 | `d707daa` | `feat: initial commit - Clean Architecture v2.0` — generic MERN scaffold of the peer-to-peer student help board (auth, requests, chat, Docker). **No Meta model integration.** |
| **Built during the hackathon** | Oct 27 → Oct 30 | `7f19666` … `7266e94` (15 commits) | All Meta Model API integration (Muse Spark 1.3 translation, Spark Open moderation, Glimmer auto-tagging, SAM 3.1 + Vision scan, Voice Transcribe, Muse Wonder certification), 8-language i18n, real-time multilingual feed, academic UI redesign v3, chat translation toggle, XP notifications, DB reset tooling, demo video. |

Verify with: `git log --date=short --pretty="%h %ad %s"`.

The demo video highlights only the features listed in the second row. The base help-board concept and scaffold from Oct 10 are the only pre-existing parts.

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

---

## 4. Architectural Justifications & Engineering Decisions

1. **Why a 6-Model Orchestrated Pipeline Instead of One Monolithic LLM?**
   - Each stage of a mentoring session has different latency, modality, and cost constraints:
     - **Fast classification (`< 300ms`):** `muse-glimmer-1.0` auto-tags the subject (`#python`, `#reseau`) as the student finishes typing.
     - **Visual segmentation + OCR:** `sam-3.1` isolates the exercise bounding box (`roi`) from a notebook photo before `muse-spark-1.3` Vision transcribes the text, preventing background clutter from degrading OCR accuracy.
     - **Low-bandwidth voice input:** `muse-voice-transcribe-1.0` lets students on 2G mobile connections dictate complex questions rather than typing on small screens.
     - **Autonomous policy enforcement:** `meta-models/muse-spark-open-1026` acts as a verifiable moderation agent returning strict JSON (`OK | MARKET | CHEAT`) in the student's language.
     - **Context-aware real-time translation:** `muse-spark-1.3` translates live chat and request feeds while preserving code identifiers and subject-specific terminology (`skillTag`).
     - **Post-session certification:** `muse-wonder-1.0` summarizes the pedagogical exchange and certifies the mentor's skill on their downloadable PDF portfolio.
2. **Why Hybrid Dual-Layer Moderation (Deterministic Regex + Agentic LLM)?**
   - Layer 1 (`server/src/utils/antiMarket.js`) blocks explicit commercial spam, phone numbers, Mobile Money keywords, and paid homework offers in **`0 ms`** at zero token cost.
   - Layer 2 (`sparkModerate` via `muse-spark-open-1026`) catches semantic cheating or disguised commercial intent, wrapped in a `3.5s` non-blocking fail-safe timeout on WebSocket chat events.
3. **Why 2-Tier Translation Caching (In-Memory LRU + MongoDB Maps) for 2G/3G Resilience?**
   - Storing translations in an in-memory LRU cache (`server/src/services/translate.service.js`) and persisting them inside `Request.titleTranslations`, `Request.descriptionTranslations`, and `Message.translations` ensures each string is translated **only once per target language**, keeping WebSocket payloads under `1 KB`.
4. **Why Behavioral Anti-Free-Riding ("Anti-Njoh") & Anti-Collusion Mechanics?**
   - An intentionally unexposed `10-ticket` reciprocity quota (`User.requestsLeft`) prevents free-riding by prompting heavy requesters to help a peer (`+1` ticket restored per completed help, with a weekly Sunday cron reset in `ticketReset.job.js` for beginners).
   - A 48-hour anti-collusion window (`RequestService.completeRequest`) and a weighted reputation formula (`70%` stars + `30%` completion ratio + unique learners bonus in `reputation.js`) guarantee that mentor portfolios are tamper-proof for recruiters.

