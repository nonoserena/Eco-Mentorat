import { Link } from 'react-router-dom';
import Icon from '../Icon';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';

/**
 * Layout partagé des pages d'authentification (connexion / inscription).
 * - Panneau gauche : logo, accroche, indicateur d'étapes optionnel
 * - Zone droite    : sélecteur de langue, bascule de thème, formulaire
 *
 * @param {string}   title1   Première ligne de l'accroche
 * @param {string}   title2   Seconde ligne (atténuée)
 * @param {string}   subtitle Phrase d'accroche
 * @param {Array}    steps    [{ label, desc, state: 'current'|'todo'|'done' }]
 */
export default function AuthLayout({ title1, title2, subtitle, steps, children }) {
  return (
    <div className="auth-grid">
      <aside className="auth-panel">
        <Link to="/" className="auth-logo">
          Eco<span>-Mentorat</span>
        </Link>
        <h1 className="auth-tagline">
          {title1}<br /><em>{title2}</em>
        </h1>
        <p className="auth-sub">{subtitle}</p>

        {steps && (
          <ol className="auth-steps">
            {steps.map((s, i) => (
              <li key={s.label} className={`auth-step is-${s.state}`}>
                <span className="auth-step-num">
                  {s.state === 'done' ? <Icon name="check" size={14} strokeWidth={2.5} /> : i + 1}
                </span>
                <span>
                  <span className="auth-step-title">{s.label}</span>
                  <span className="auth-step-desc">{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </aside>

      <main className="auth-main">
        <div className="auth-toolbar">
          <Link to="/" className="auth-logo-mobile">
            Eco<span>-Mentorat</span>
          </Link>
          <div style={{ display: 'flex', gap: 8, marginInlineStart: 'auto' }}>
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
        </div>
        <div className="auth-body">
          <div className="auth-card">{children}</div>
        </div>
      </main>
    </div>
  );
}
