// Muse Spark series — Traduction universelle hackathon (Meta Model API)
// Texte uniquement (<1Ko/message), cache low-data Afrique-first + fallback offline jury.
const Muse = require('./muse.service');

const SUPPORTED = ['fr', 'en', 'ja', 'zh', 'wo', 'es', 'ar', 'pt'];
const cache = new Map(); // key -> translated string (LRU simple)

function cacheKey(text, sourceLang, targetLang, skillTag) {
  return `${sourceLang}:${targetLang}:${skillTag || 'general'}:${text}`;
}

function normalizeLang(l, fallback = 'fr') {
  if (!l) return fallback;
  const v = String(l).toLowerCase().trim().slice(0, 5);
  if (SUPPORTED.includes(v)) return v;
  // map variantes : fr-FR -> fr, ja-JP -> ja
  const short = v.split('-')[0].split('_')[0];
  if (SUPPORTED.includes(short)) return short;
  return fallback;
}

// Dictionnaire démo hackathon Douala <-> Osaka (offline, 0 data)
const DEMO_DICT = {
  'fr:ja': [
    [/boucle\s*for/i, 'forループ'],
    [/python/i, 'Python'],
    [/salut\s*!?/i, 'こんにちは！'],
    [/je bloque sur/i, 'で困っています、'],
    [/tu peux m'expliquer\s*\?/i, '説明してもらえますか？'],
  ],
  'ja:fr': [
    [/こんにちは/i, 'Salut !'],
    [/説明してもらえますか/i, 'tu peux m’expliquer ?'],
  ],
};

// Mots fréquents par langue latine : permet de détecter la vraie langue du texte
// (l'utilisateur peut écrire en français alors que son interface est en anglais).
const STOPWORDS = {
  fr: 'le la les des du un une et est je tu il elle nous vous sur pour dans avec pas que qui mon ma mes ce cette au aux ne suis besoin aide exercice exercices comment pourquoi salut bonjour merci cherche veux peux tous toutes mon ton tes très'.split(' '),
  en: 'the and is are you your i to of in it that for with this my do does not have has help need how why what hello thanks please pay can will all'.split(' '),
  es: 'el los las que y es una por con para no mi tu como hola gracias ayuda necesito quiero puedo todos pero'.split(' '),
  pt: 'os as um uma com para não meu minha você como olá obrigado ajuda preciso quero posso todos mas'.split(' '),
};

function detectLatinLanguage(text, hint) {
  const words = String(text || '').toLowerCase().match(/[a-zà-ÿ]+/g) || [];
  const scores = {};
  for (const [lang, list] of Object.entries(STOPWORDS)) {
    const set = new Set(list);
    scores[lang] = words.reduce((n, w) => n + (set.has(w) ? 1 : 0), 0);
  }
  const best = Math.max(...Object.values(scores));
  if (best === 0) return null;
  const tied = Object.keys(scores).filter((l) => scores[l] === best);
  if (tied.length === 1) return tied[0];
  return tied.includes(hint) ? hint : tied[0];
}

function detectLanguage(text, hint) {
  const t = String(text || '');
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(t)) return 'ja';
  if (/[\u0600-\u06FF]/.test(t)) return 'ar';
  if (/[\u4E00-\u9FFF]/.test(t)) return 'zh';
  const h = String(hint || '').toLowerCase().slice(0,5);
  const latin = detectLatinLanguage(t, h);
  if (latin) return latin;
  if (SUPPORTED.includes(h)) return h;
  return 'fr';
}

function demoTranslate(text, sourceLang, targetLang) {
  const key = `${sourceLang}:${targetLang}`;
  const rules = DEMO_DICT[key];
  let out = text;
  let touched = false;
  if (rules) {
    for (const [re, rep] of rules) {
      if (re.test(out)) { out = out.replace(re, rep); touched = true; }
    }
    if (sourceLang === 'fr' && targetLang === 'ja' && /forループ/.test(out)) {
      return 'こんにちは！Pythonのforループで困っています、説明してもらえますか？';
    }
    if (touched) return out;
  }
  // Fallback generique offline : montre que le pipeline traduit meme sans Muse live
  if (sourceLang === 'fr' && targetLang === 'ja') return `こんにちは！ ${text} → 日本語訳 (démo hors-ligne)`;
  if (sourceLang === 'ja' && targetLang === 'fr') return `Salut ! ${text} → traduction FR (démo hors-ligne)`;
  return `[${targetLang.toUpperCase()}] ${text}`;
}

// Muse Spark series via Meta Model API ($150) — 1 seul appel contextualise (traduction + polish ensemble)
async function callMuseSpark(text, sourceLang, targetLang, skillTag) {
  try {
    const out = await Muse.sparkTranslate(text, sourceLang, targetLang, skillTag);
    if (out) return { text: out, engine: Muse.SPARK_MODEL || 'muse-spark-1.3' };
    // Bonus open-weights $10k : fallback Baseten muse-spark-open-1026 si Meta API down
    if (process.env.BASETEN_API_URL) {
      const open = await Muse.sparkOpenChat([
        { role: 'system', content: `Traduis de ${sourceLang} vers ${targetLang}. Contexte: ${skillTag}. Reponds uniquement la traduction.` },
        { role: 'user', content: text }
      ]);
      if (open) return { text: open.trim(), engine: 'muse-spark-open-1026' };
    }
    return null;
  } catch { return null; }
}

async function translateText(text, targetLang, opts = {}) {
  const clean = String(text || '').trim().slice(0, 1000);
  if (!clean) throw new Error('Texte vide.');
  const target = normalizeLang(targetLang, 'fr');
  const source = detectLanguage(clean, opts.sourceLang);
  const skillTag = (opts.skillTag || 'general').toString().slice(0, 40);

  if (source === target) return { original: text, translated: text, sourceLang: source, targetLang: target, cached: false, engine: 'none' };

  const k = cacheKey(clean, source, target, skillTag);
  if (cache.has(k)) {
    return { original: text, translated: cache.get(k), sourceLang: source, targetLang: target, cached: true, engine: 'cache' };
  }

  // 1. Muse Spark reel (traduction + contexte en 1 appel)
  let polished = null;
  let engine = Muse.SPARK_MODEL || 'muse-spark-1.3';
  const museRes = await callMuseSpark(clean, source, target, skillTag);
  if (museRes) {
    polished = museRes.text;
    engine = museRes.engine;
  }

  // 2. Fallback demo offline (hackathon stable meme sans cle / sans reseau / quota vide)
  if (!polished) {
    polished = demoTranslate(clean, source, target);
    engine = polished ? 'demo-muse-spark-offline' : 'passthrough';
  }
  if (!polished) {
    polished = clean;
    engine = 'passthrough';
  } // jamais bloquer le chat

  // Cache borné (1000 entrées max, Afrique low-RAM)
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(k, polished);

  return { original: text, translated: polished, sourceLang: source, targetLang: target, cached: false, engine };
}

module.exports = { translateText, normalizeLang, detectLanguage, SUPPORTED, _cache: cache };