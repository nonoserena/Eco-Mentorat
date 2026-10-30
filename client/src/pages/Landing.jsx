import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import LanguageSwitcher from '../components/LanguageSwitcher';

/* ─────────────────────────────────────────────────────────
   Données statiques — traduites via i18n dans le rendu
   ───────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: 'users',       key: 'feat1' },
  { icon: 'globe',       key: 'feat2' },
  { icon: 'award',       key: 'feat3' },
  { icon: 'shield',      key: 'feat4' },
  { icon: 'trophy',      key: 'feat5' },
  { icon: 'file-text',   key: 'feat6' },
];

const FEATURE_ICON_COLORS = {
  users:        { bg: '#EEF2F8', stroke: '#1E3A5F' },
  globe:        { bg: '#F0EBF8', stroke: '#4C3575' },
  award:        { bg: '#F0FDF4', stroke: '#1A5C38' },
  shield:       { bg: '#EEF2F8', stroke: '#1E3A5F' },
  trophy:       { bg: '#F0EBF8', stroke: '#4C3575' },
  'file-text':  { bg: '#F0FDF4', stroke: '#1A5C38' },
};

const MOCK_LEADERBOARD = [
  { pos: 1, initial: 'A', name: 'aidaninja_cm', grade: 'Légende', gradeKey: 'legende', xp: '5 420' },
  { pos: 2, initial: 'S', name: 'serena_dev',   grade: 'Expert',  gradeKey: 'expert',  xp: '2 310' },
  { pos: 3, initial: 'K', name: 'kaito_jp',     grade: 'Confirmé',gradeKey: 'confirme',xp: '1 080' },
];

const AVATAR_COLORS = ['#1E3A5F', '#4C3575', '#1A5C38'];

/* ─────────────────────────────────────────────────────────
   Composants internes
   ───────────────────────────────────────────────────────── */

/** Bulle avatar initiale */
function Avatar({ initial, bg, size = 32 }) {
  return (
    <div
      style={{
        width: size, height: size,
        background: bg,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

/** Badge de grade */
function GradeBadge({ gradeKey, label }) {
  const MAP = {
    novice:   'grade-novice',
    apprenti: 'grade-apprenti',
    confirme: 'grade-confirme',
    expert:   'grade-expert',
    legende:  'grade-legende',
  };
  return (
    <span className={`badge ${MAP[gradeKey] || 'grade-novice'}`} style={{ fontSize: 11 }}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Composant principal Landing
   ───────────────────────────────────────────────────────── */
export default function Landing() {
  const { t } = useTranslation();

  return (
    <div style={{ background: '#F8F7F4', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <nav style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E0DB',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 48px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <span style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F', letterSpacing: '-0.03em' }}>
          Eco<span style={{ color: '#4C3575' }}>-Mentorat</span>
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageSwitcher compact />
          <Link
            to="/login"
            style={{
              padding: '8px 18px', fontSize: 14, fontWeight: 500,
              color: '#1E3A5F', border: '1px solid transparent',
              borderRadius: 6, textDecoration: 'none',
              transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEF2F8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {t('nav.login')}
          </Link>
          <Link
            to="/register"
            style={{
              padding: '8px 18px', fontSize: 14, fontWeight: 600,
              color: '#FFFFFF', background: '#1E3A5F',
              border: '1px solid #1E3A5F', borderRadius: 6,
              textDecoration: 'none', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#162E4D'}
            onMouseLeave={e => e.currentTarget.style.background = '#1E3A5F'}
          >
            {t('nav.register')}
          </Link>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E0DB',
        padding: '80px 48px 72px',
        textAlign: 'center',
      }}>
        {/* Pill label */}
        <div style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#4C3575', background: '#F0EBF8',
          border: '1px solid #D8CFF0',
          borderRadius: 4, padding: '4px 12px', marginBottom: 24,
        }}>
          {t('landing.label')}
        </div>

        {/* Titre */}
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 800, color: '#1E3A5F',
          letterSpacing: '-0.04em', lineHeight: 1.1,
          maxWidth: 680, margin: '0 auto 16px',
        }}>
          {t('landing.heroTitle1')}{' '}
          <span style={{ color: '#4C3575' }}>{t('landing.heroTitle2')}</span>
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontSize: 18, color: '#6B7280',
          maxWidth: 520, margin: '0 auto 36px',
          lineHeight: 1.65,
        }}>
          {t('landing.heroSub')}
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/register"
            style={{
              padding: '12px 28px', fontSize: 15, fontWeight: 600,
              background: '#1E3A5F', color: '#FFFFFF',
              border: '1px solid #1E3A5F', borderRadius: 6,
              textDecoration: 'none', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#162E4D'}
            onMouseLeave={e => e.currentTarget.style.background = '#1E3A5F'}
          >
            {t('landing.ctaJoin')}
          </Link>
          <Link
            to="/login"
            style={{
              padding: '12px 28px', fontSize: 15, fontWeight: 600,
              background: 'transparent', color: '#1E3A5F',
              border: '1px solid #E2E0DB', borderRadius: 6,
              textDecoration: 'none', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEF2F8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {t('landing.ctaLogin')}
          </Link>
        </div>
      </section>

      {/* ══════════════════ BARRE STATS ══════════════════ */}
      <div style={{
        background: '#1E3A5F',
        padding: '28px 48px',
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(32px, 5vw, 64px)',
        flexWrap: 'wrap',
      }}>
        {[
          { num: '8',    label: t('landing.statLangs') },
          { num: '12+',  label: t('landing.statSubjects') },
          { num: '100%', label: t('landing.statFree') },
          { num: '0',    label: t('landing.statFees') },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════ FONCTIONNALITÉS ══════════════════ */}
      <section style={{ padding: '72px 48px', background: '#F8F7F4', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4C3575', marginBottom: 8 }}>
          {t('landing.whyLabel')}
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1E3A5F', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {t('landing.whyTitle')}
        </h2>
        <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.6 }}>
          {t('landing.whySub')}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20, maxWidth: 960, margin: '0 auto',
        }}>
          {FEATURES.map(({ icon, key }) => {
            const col = FEATURE_ICON_COLORS[icon];
            return (
              <div key={key} className="card" style={{ padding: 28, textAlign: 'left' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: col.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon name={icon} size={20} color={col.stroke} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>
                  {t(`landing.${key}Title`)}
                </h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
                  {t(`landing.${key}Desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════ COMMENT ÇA MARCHE ══════════════════ */}
      <section style={{ padding: '72px 48px', background: '#FFFFFF', borderTop: '1px solid #E2E0DB', borderBottom: '1px solid #E2E0DB', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4C3575', marginBottom: 8 }}>
          {t('landing.howLabel')}
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1E3A5F', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {t('landing.howTitle')}
        </h2>
        <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.6 }}>
          {t('landing.howSub')}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32, maxWidth: 860, margin: '0 auto',
          position: 'relative',
        }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#1E3A5F', color: '#FFFFFF',
                fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                {n}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>
                {t(`landing.step${n}Title`)}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
                {t(`landing.step${n}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ CLASSEMENT APERÇU ══════════════════ */}
      <section style={{ padding: '72px 48px', background: '#F8F7F4', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4C3575', marginBottom: 8 }}>
          {t('landing.rankLabel')}
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1E3A5F', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {t('landing.rankTitle')}
        </h2>
        <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.6 }}>
          {t('landing.rankSub')}
        </p>

        {/* Tableau */}
        <div className="card" style={{ maxWidth: 640, margin: '0 auto', overflow: 'hidden' }}>
          {/* En-tête */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 110px 90px',
            padding: '10px 20px', background: '#F3F2EF',
            borderBottom: '1px solid #E2E0DB',
            fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6B7280',
            textAlign: 'left',
          }}>
            <span>#</span>
            <span>{t('leaderboard.mentor')}</span>
            <span>{t('leaderboard.grade')}</span>
            <span>{t('leaderboard.score')}</span>
          </div>

          {MOCK_LEADERBOARD.map((row, i) => (
            <div key={row.pos} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 110px 90px',
              padding: '14px 20px', alignItems: 'center',
              borderBottom: i < MOCK_LEADERBOARD.length - 1 ? '1px solid #E2E0DB' : 'none',
              textAlign: 'left',
            }}>
              <span style={{
                fontWeight: 700, fontSize: 14,
                color: i === 0 ? '#92710A' : i === 1 ? '#6B7280' : '#7C4A1C',
              }}>
                {row.pos}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initial={row.initial} bg={AVATAR_COLORS[i]} size={32} />
                <span style={{ fontWeight: 500, fontSize: 14, color: '#1A1A2E' }}>{row.name}</span>
              </div>
              <GradeBadge gradeKey={row.gradeKey} label={row.grade} />
              <span style={{ fontWeight: 600, fontSize: 13, color: '#1E3A5F' }}>{row.xp} XP</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ CTA FINAL ══════════════════ */}
      <section style={{
        background: '#1E3A5F',
        padding: '72px 48px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {t('landing.ctaFinalTitle')}
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 32 }}>
          {t('landing.ctaFinalSub')}
        </p>
        <Link
          to="/register"
          style={{
            padding: '13px 32px', fontSize: 15, fontWeight: 600,
            background: '#FFFFFF', color: '#1E3A5F',
            border: 'none', borderRadius: 6,
            textDecoration: 'none', display: 'inline-block',
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#EEF2F8'}
          onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
        >
          {t('landing.ctaCreate')}
        </Link>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E0DB',
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F' }}>
          Eco<span style={{ color: '#4C3575' }}>-Mentorat</span>
        </span>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>
          {t('landing.footerTag')}
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { to: '/register', label: t('nav.register') },
            { to: '/login',    label: t('nav.login') },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1E3A5F'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </footer>

    </div>
  );
}
