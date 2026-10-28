import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import wo from './locales/wo.json';
import zh from './locales/zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ja: { translation: ja },
      ar: { translation: ar },
      pt: { translation: pt },
      es: { translation: es },
      wo: { translation: wo },
      zh: { translation: zh }
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'ja', 'ar', 'pt', 'es', 'wo', 'zh'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'eco-lang',
      caches: ['localStorage']
    },
    interpolation: { escapeValue: false }
  });

export default i18n;