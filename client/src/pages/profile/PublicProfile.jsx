import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/format';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Icon from '../../components/Icon';

const getRankBadgeClass = (rankTitle) => {
  const map = {
    Novice: 'grade-novice',
    Apprenti: 'grade-apprenti',
    Confirmé: 'grade-confirme',
    Confirme: 'grade-confirme',
    Expert: 'grade-expert',
    Légende: 'grade-legende',
    Legende: 'grade-legende',
  };
  return map[rankTitle] || 'grade-novice';
};

const TAG_STYLES = {
  '#java': 'chip tone-blue',
  '#reseau': 'chip tone-violet',
  '#linux': 'chip tone-green',
  '#python': 'chip tone-blue',
  '#droit': 'chip tone-violet',
  '#web': 'chip tone-green',
  '#mathematiques': 'chip tone-blue',
  '#physique': 'chip tone-violet',
};

export default function PublicProfile() {
  const { username } = useParams();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'fr').slice(0, 2);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPublicProfile(username);
        setProfile(res.data.profile);
      } catch (err) {
        setError(err.response?.data?.message || 'Profil introuvable');
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  const rankClass = getRankBadgeClass(profile?.rankTitle);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      {/* Barre de navigation publique */}
      <header
        style={{
          height: '64px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--heading)', letterSpacing: '-0.03em' }}>
            Eco<span style={{ color: 'var(--accent)' }}>-Mentorat</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge-cert">
            <Icon name="check" size={13} />
            <span>Profil Certifié Étudiant</span>
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: '36px 20px', maxWidth: '860px', width: '100%', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--surface-alt)',
                color: 'var(--muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Icon name="x-circle" size={24} />
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--heading)', marginBottom: '8px' }}>
              Profil étudiant non trouvé
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
              L'identifiant &laquo; {username} &raquo; ne correspond à aucun membre certifié.
            </p>
            <Link to="/" className="btn btn-outline" style={{ display: 'inline-flex', gap: '8px', padding: '8px 16px' }}>
              <Icon name="chevron-left" size={14} />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
        ) : (
          <div>
            {/* Carte d'identité académique */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '28px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'var(--primary-fg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: '800',
                    flexShrink: 0,
                  }}
                >
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--heading)' }}>
                      {profile?.username}
                    </h1>
                    <span className={`badge ${rankClass}`} style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                      Grade : {profile?.rankTitle || 'Novice'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Membre certifié de la communauté d'entraide académique Eco-Mentorat
                  </p>
                </div>
              </div>

              {/* 3 Métriques vérifiées */}
              <div className="stats-grid" style={{ marginTop: '24px', marginBottom: '8px' }}>
                <div className="stat-card" style={{ background: 'var(--surface-alt)' }}>
                  <div className="stat-top">
                    <Icon name="award" size={15} />
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                      Points XP
                    </span>
                  </div>
                  <div className="stat-val">{formatNumber(profile?.xpPoints ?? 0, lang)} XP</div>
                  <div className="stat-sub">Cumulés au mérite</div>
                </div>

                <div className="stat-card" style={{ background: 'var(--surface-alt)' }}>
                  <div className="stat-top">
                    <Icon name="check" size={15} />
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                      Entraides
                    </span>
                  </div>
                  <div className="stat-val">
                    {formatNumber(profile?.skillsMetrics?.reduce((acc, m) => acc + (m.helpCount || 0), 0) ?? 0, lang)}
                  </div>
                  <div className="stat-sub">Sessions réussies</div>
                </div>

                <div className="stat-card" style={{ background: 'var(--surface-alt)' }}>
                  <div className="stat-top">
                    <Icon name="star" size={15} />
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                      Réputation
                    </span>
                  </div>
                  <div className="stat-val">
                    {profile?.skillsMetrics?.length > 0
                      ? (profile.skillsMetrics.reduce((acc, m) => acc + (m.reputationScore || 0), 0) / profile.skillsMetrics.length).toFixed(1)
                      : '5.0'} / 5.0
                  </div>
                  <div className="stat-sub">Score moyen certifié</div>
                </div>
              </div>
            </div>

            {/* Compétences validées par les pairs */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--heading)', marginBottom: '12px' }}>
                Compétences académiques validées par les pairs
              </h2>
              {profile?.skillsMetrics && profile.skillsMetrics.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.skillsMetrics.map((metric) => (
                    <span key={metric.skillTag} className={TAG_STYLES[metric.skillTag] || 'chip'}>
                      {metric.skillTag} ({formatNumber(metric.reputationScore, lang)} / 5)
                    </span>
                  ))}
                </div>
              ) : profile?.skillsDeclarated && profile.skillsDeclarated.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.skillsDeclarated.map((skill) => (
                    <span key={skill} className={TAG_STYLES[skill] || 'chip'}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Aucune compétence spécifique déclarée pour le moment.
                </p>
              )}
            </div>

            {/* Attestation pour recruteurs */}
            <div
              style={{
                background: 'var(--blue-light)',
                border: '1px solid var(--blue)',
                borderRadius: '8px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px', fontSize: '13px', color: 'var(--blue)', lineHeight: 1.6 }}>
                <strong>Attestation académique vérifiable :</strong> Ce profil atteste des compétences réelles
                en pédagogie, fiabilité et entraide démontrées auprès d'étudiants de l'enseignement supérieur.
              </div>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                <span>Rejoindre la communauté</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer sobre */}
      <footer
        style={{
          padding: '20px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--muted)',
          background: 'var(--surface)',
        }}
      >
        Eco-Mentorat &copy; {new Date().getFullYear()} &mdash; Plateforme d'entraide académique 100% gratuite et certifiée.
      </footer>
    </div>
  );
}
