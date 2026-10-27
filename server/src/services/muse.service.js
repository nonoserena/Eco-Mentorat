// Muse — Client unique Meta Model API ($150 credits) — server-side only
// Conforme fiche hackathon : Spark series, Wonder, Image, Voice Transcribe, SAM 3.1
// + Open-weights : Glimmer + Spark Open (muse-spark-open-1026 via Baseten)
// Securite : cle jamais exposee au front. Cache + fallback offline pour 2G/jury.

const META_API_URL = process.env.META_MODEL_API_URL || process.env.MUSE_SPARK_API_URL || 'https://api.meta.ai/v1';
const META_API_KEY = process.env.META_API_KEY || process.env.MUSE_API_KEY || '';
const SPARK_MODEL = process.env.MUSE_SPARK_MODEL || 'muse-spark-1.3';
const SPARK_OPEN_MODEL = process.env.MUSE_SPARK_OPEN_MODEL || 'meta-models/muse-spark-open-1026';
const WONDER_MODEL = process.env.MUSE_WONDER_MODEL || 'muse-wonder-1.0';
const TRANSCRIBE_MODEL = process.env.MUSE_TRANSCRIBE_MODEL || 'muse-voice-transcribe-1.0';
const BASETEN_URL = process.env.BASETEN_API_URL || '';
const BASETEN_KEY = process.env.BASETEN_API_KEY || '';

async function postJSON(url, apiKey, body, timeoutMs = 30000) {
  if (!url || !apiKey) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      if (res.status === 429 || res.status === 401 || res.status === 402) console.warn(`[MUSE] quota/auth ${res.status} — fallback offline`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn(`[MUSE] call fail ${e.message} — fallback offline`);
    return null;
  }
}

// 1. Spark — chat/completions OpenAI-compatible
async function sparkChat(messages, opts = {}) {
  const url = `${META_API_URL.replace(/\/$/, '')}/chat/completions`;
  const data = await postJSON(url, META_API_KEY, {
    model: opts.model || SPARK_MODEL,
    messages,
    max_tokens: opts.max_tokens || 2000,
    temperature: opts.temperature ?? 0.3,
  });
  if (!data) return null;
  return data.choices?.[0]?.message?.content || data.text || data.result || null;
}

// 2. P0-1 Traduction contextualisee Douala<->Osaka
async function sparkTranslate(text, sourceLang, targetLang, skillTag = 'general') {
  if (!META_API_KEY) return null;
  const system = `Tu es Muse Spark, traducteur pedagogique. Traduis de ${sourceLang} vers ${targetLang}. Contexte matiere: ${skillTag}. Ton simple etudiant, sens preserve, sans explication. Reponds uniquement la traduction.`;
  const out = await sparkChat(
    [{ role: 'system', content: system }, { role: 'user', content: text }],
    { max_tokens: 2000 }
  );
  return out ? out.trim() : null;
}

// 3. P0-2 Moderation agentique OK|CHEAT|MARKET
async function sparkModerate(text, skillTag = 'general') {
  if (!META_API_KEY) return null;
  const system = `Tu es l'agent moderateur Eco-Mentorat (Muse Spark). Reponds JSON strict: {"label":"OK|CHEAT|MARKET","confidence":0-1,"reason":"courte"}. CHEAT=triche examen/devoir a rendre. MARKET=argent/contact externe. OK sinon. Contexte: ${skillTag}.`;
  const out = await sparkChat(
    [{ role: 'system', content: system }, { role: 'user', content: text }],
    { max_tokens: 200, temperature: 0 }
  );
  if (!out) return null;
  try {
    const m = out.match(/\{[^}]+\}/);
    return JSON.parse(m ? m[0] : out);
  } catch { return null; }
}

// 4. Voice Transcribe — audio -> sous-titres (P1 low-debit)
async function voiceTranscribe(audioBuffer, lang = 'fr') {
  const url = process.env.MUSE_TRANSCRIBE_URL;
  if (!url || !META_API_KEY || !audioBuffer) return null;
  // Endpoint binaire ou multipart selon doc Meta — fallback null = on reste texte
  return await postJSON(url, META_API_KEY, { model: TRANSCRIBE_MODEL, lang });
}

// 5. Wonder / Image — visuel portfolio + vignette challenge (P0-3 creatif)
async function wonderGenerate(prompt) {
  const url = process.env.MUSE_WONDER_URL;
  if (!url || !META_API_KEY) return null;
  return await postJSON(url, META_API_KEY, { model: WONDER_MODEL, prompt });
}

// 6. Bonus $10k open-weights : Spark Open via Baseten
async function sparkOpenChat(messages) {
  if (!BASETEN_URL || !BASETEN_KEY) return null;
  return await postJSON(
    BASETEN_URL,
    BASETEN_KEY,
    { model: SPARK_OPEN_MODEL, messages, max_tokens: 400 },
    10000
  ).then((d) => d?.choices?.[0]?.message?.content || null);
}

module.exports = { sparkChat, sparkTranslate, sparkModerate, voiceTranscribe, wonderGenerate, sparkOpenChat, SPARK_MODEL, SPARK_OPEN_MODEL, WONDER_MODEL, TRANSCRIBE_MODEL };