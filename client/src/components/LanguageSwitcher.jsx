import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'ar', label: '🇲🇦 العربية' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'wo', label: '🇸🇳 Wolof' },
  { code: 'zh', label: '🇨🇳 中文' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.language || 'fr').slice(0, 2);

  const change = (code) => {
    try {
      localStorage.setItem('eco-lang', code);
      i18n.changeLanguage(code);
      document.documentElement.lang = code;
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    } catch {}
  };

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'w-full'}`} title={t('common.language')}>
      <span className="text-sm">🌍</span>
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}