import { useTranslation } from 'react-i18next';
import Icon from './Icon';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'ar', label: 'العربية' },
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'wo', label: 'Wolof' },
  { code: 'zh', label: '中文' },
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
    } catch { /* stockage indisponible : on ignore */ }
  };

  return (
    <label
      title={t('common.language')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        width: compact ? 'auto' : '100%', color: 'var(--muted)',
      }}
    >
      <Icon name="globe" size={16} />
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        aria-label={t('common.language')}
        style={{
          fontSize: 13, fontFamily: 'inherit', padding: '7px 8px',
          border: '1px solid var(--border)', borderRadius: 6,
          background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer',
        }}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}
