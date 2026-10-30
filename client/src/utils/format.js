// Formatage localisé par langue pays — chiffres + dates 100% langue nationale
export const LOCALE_MAP = {
  fr: 'fr-FR',
  en: 'en-US',
  ja: 'ja-JP',
  ar: 'ar-MA',
  pt: 'pt-BR',
  es: 'es-ES',
  wo: 'fr-SN',
  zh: 'zh-CN',
};

export const getLocale = (lang) => LOCALE_MAP[lang] || 'fr-FR';

export const formatNumber = (value, lang) => {
  const n = Number(value ?? 0);
  try {
    return new Intl.NumberFormat(getLocale(lang)).format(n);
  } catch {
    return String(n);
  }
};

export const formatDateTime = (date, lang) => {
  try {
    return new Date(date).toLocaleDateString(getLocale(lang), {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return new Date(date).toLocaleString();
  }
};

export const formatTime = (date, lang) => {
  try {
    return new Date(date).toLocaleTimeString(getLocale(lang), { hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date(date).toLocaleTimeString();
  }
};