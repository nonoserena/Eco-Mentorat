import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';

/* Fonctionnalités : icône + palette (jetons CSS, compatibles thème sombre) */
const FEATURES = [
  { icon: 'users',     key: 'feat1', tone: 'blue' },
  { icon: 'globe',     key: 'feat2', tone: 'violet' },
  { icon: 'award',     key: 'feat3', tone: 'green' },
  { icon: 'shield',    key: 'feat4', tone: 'blue' },
  { icon: 'trophy',    key: 'feat5', tone: 'violet' },
  { icon: 'file-text', key: 'feat6', tone: 'green' },
];

const MOCK_LEADERBOARD = [
  { pos: 1, initial: 'A', name: 'aidaninja_cm', grade: 'Légende',  gradeKey: 'legende',  xp: '5 420', tone: 'blue' },
  { pos: 2, initial: 'S', name: 'serena_dev',   grade: 'Expert',   gradeKey: 'expert',   xp: '2 310', tone: 'violet' },
  { pos: 3, initial: 'K', name: 'kaito_jp',     grade: 'Confirmé', gradeKey: 'confirme', xp: '1 080', tone: 'green' },
];

const AVATAR_BG = { blue: '#1E3A5F', violet: '#4C3575', green: '#1A5C38' };

const eyebrow = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 8,
};
const h2 = {
  fontSize: 30, fontWeight: 700, color: 'var(--heading)',
  letterSpacing: '-0.03em', marginBottom: 12,
};
const lead = {
  fontSize: 15, color: 'var(--muted)', maxWidth: 480,
  margin: '0 auto 48px', lineHeight: 1.6,
};

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, padding: '0 clamp(16px, 4vw, 48px)',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--heading)', letterSpacing: '-0.03em' }}>
          Eco<span style={{ color: 'var(--accent)' }}>-Mentorat</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageSwitcher compact />
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost">{t('nav.login')}</Link>
          <Link to="/register" className="btn btn-primary">{t('nav.register')}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '80px clamp(16px, 4vw, 48px) 72px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block', fontSize: 11, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--accent)', background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)', borderRadius: 4,
          padding: '4px 12px', marginBottom: 24,
        }}>
          {t('landing.label')}
        </div>
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, color: 'var(--heading)',
          letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: 680, margin: '0 auto 16px',
        }}>
          {t('landing.heroTitle1')}{' '}
          <span style={{ color: 'var(--accent)' }}>{t('landing.heroTitle2')}</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.65 }}>
          {t('landing.heroSub')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
            {t('landing.ctaJoin')}
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '13px 28px', fontSize: 15 }}>
            {t('landing.ctaLogin')}
          </Link>
        </div>
      </section>

      {/* BARRE STATS */}
      <div style={{
        background: 'var(--band)', padding: '28px clamp(16px, 4vw, 48px)',
        display: 'flex', justifyContent: 'center', gap: 'clamp(32px, 5vw, 64px)', flexWrap: 'wrap',
      }}>
        {[
          { num: '8',    label: t('landing.statLangs') },
          { num: '12+',  label: t('landing.statSubjects') },
          { num: '100%', label: t('landing.statFree') },
          { num: '0',    label: t('landing.statFees') },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--band-fg)', letterSpacing: '-0.03em' }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'var(--band-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FONCTIONNALITÉS */}
      <section style={{ padding: '72px clamp(16px, 4vw, 48px)', textAlign: 'center' }}>
        <div style={eyebrow}>{t('landing.whyLabel')}</div>
        <h2 style={h2}>{t('landing.whyTitle')}</h2>
        <p style={lead}>{t('landing.whySub')}</p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20, maxWidth: 960, margin: '0 auto',
        }}>
          {FEATURES.map(({ icon, key, tone }) => (
            <div key={key} className="card" style={{ padding: 28, textAlign: 'start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, marginBottom: 16,
                background: `var(--${tone}-light)`, color: `var(--${tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={icon} size={20} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                {t(`landing.${key}Title`)}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
                {t(`landing.${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{
        padding: '72px clamp(16px, 4vw, 48px)', background: 'var(--surface)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', textAlign: 'center',
      }}>
        <div style={eyebrow}>{t('landing.howLabel')}</div>
        <h2 style={h2}>{t('landing.howTitle')}</h2>
        <p style={lead}>{t('landing.howSub')}</p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32, maxWidth: 860, margin: '0 auto',
        }}>
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', margin: '0 auto 16px',
                background: 'var(--primary)', color: 'var(--primary-fg)',
                fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                {t(`landing.step${n}Title`)}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
                {t(`landing.step${n}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLASSEMENT APERÇU */}
      <section style={{ padding: '72px clamp(16px, 4vw, 48px)', textAlign: 'center' }}>
        <div style={eyebrow}>{t('landing.rankLabel')}</div>
        <h2 style={h2}>{t('landing.rankTitle')}</h2>
        <p style={{ ...lead, marginBottom: 40 }}>{t('landing.rankSub')}</p>

        <div className="card" style={{ maxWidth: 640, margin: '0 auto', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 110px 90px',
            padding: '10px 20px', background: 'var(--surface-alt)',
            borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', textAlign: 'start',
          }}>
            <span>#</span>
            <span>{t('leaderboard.mentor')}</span>
            <span>{t('leaderboard.grade')}</span>
            <span>{t('leaderboard.score')}</span>
          </div>
          {MOCK_LEADERBOARD.map((row, i) => (
            <div key={row.pos} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 110px 90px',
              padding: '14px 20px', alignItems: 'center', textAlign: 'start',
              borderBottom: i < MOCK_LEADERBOARD.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--muted)' }}>{row.pos}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: AVATAR_BG[row.tone],
                  color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{row.initial}</div>
                <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{row.name}</span>
              </div>
              <span><span className={`badge grade-${row.gradeKey}`}>{row.grade}</span></span>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--blue)' }}>{row.xp} XP</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: 'var(--band)', padding: '72px clamp(16px, 4vw, 48px)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--band-fg)', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {t('landing.ctaFinalTitle')}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--band-muted)', marginBottom: 32 }}>
          {t('landing.ctaFinalSub')}
        </p>
        <Link to="/register" className="btn" style={{
          padding: '13px 32px', fontSize: 15,
          background: 'var(--inverse-bg)', color: 'var(--inverse-fg)',
        }}>
          {t('landing.ctaCreate')}
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        padding: '24px clamp(16px, 4vw, 48px)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading)' }}>
          Eco<span style={{ color: 'var(--accent)' }}>-Mentorat</span>
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t('landing.footerTag')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/register" className="btn btn-ghost">{t('nav.register')}</Link>
          <Link to="/login" className="btn btn-ghost">{t('nav.login')}</Link>
        </div>
      </footer>
    </div>
  );
}
