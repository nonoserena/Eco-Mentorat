import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

/**
 * Bouton de bascule thème clair / sombre.
 * Réutilisable sur toutes les pages (landing, auth, dashboard).
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const label = isDark ? t('common.lightMode') : t('common.darkMode');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      style={{
        width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
        border: '1px solid var(--border)', borderRadius: 6,
      }}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={16} />
    </button>
  );
}
