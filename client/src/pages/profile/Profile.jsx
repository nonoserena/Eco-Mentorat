import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/format';
import { getPortfolio, getMyProfile, updateMyLang } from '../../services/api';
import Icon from '../../components/Icon';

const RANK_MILESTONES = [
  { title: 'Novice', xp: 0 },
  { title: 'Apprenti', xp: 200 },
  { title: 'Confirmé', xp: 800 },
  { title: 'Expert', xp: 2000 },
  { title: 'Légende', xp: 5000 },
];

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

const getXPProgress = (xp) => {
  const thresholds = [0, 200, 800, 2000, 5000];
  const nextThresholds = [200, 800, 2000, 5000, 5000];
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      level = i;
      break;
    }
  }
  if (level === thresholds.length - 1) {
    return { percent: 100, current: 5000, next: 5000, isMax: true };
  }
  const current = thresholds[level];
  const next = nextThresholds[level];
  const percent = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
  return { percent, current, next, isMax: false };
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

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [freshData, setFreshData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setFreshData(res.data.user);
        updateUser(res.data.user);
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const profileData = freshData || user;
  const lang = (profileData?.preferredLang || user?.preferredLang || i18n.language || 'fr').slice(0, 2);
  const rankClass = getRankBadgeClass(profileData?.rankTitle);
  const xpInfo = getXPProgress(profileData?.xpPoints ?? 0);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await getPortfolio(user.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Portfolio_EcoMentorat_${user.username}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('profile.downloadErr'));
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/u/${profileData?.username}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLangChange = async (e) => {
    const newLang = e.target.value;
    try {
      const res = await updateMyLang(newLang);
      updateUser(res.data.user);
      setFreshData((p) => ({ ...(p || profileData), preferredLang: res.data.user.preferredLang }));
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, preferredLang: res.data.user.preferredLang }));
    } catch {
      alert(t('profile.langErr'));
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* Titre de page */}
        <div style={{ marginBottom: '24px' }}>
          <h1 className="page-title">{t('profile.title')}</h1>
          <p className="page-sub">{t('profile.subtitle')}</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          </div>
        ) : (
          <>
            {/* Carte d'identité principale */}
            <div className="profile-hero">
              <div className="profile-avatar">
                {profileData?.username?.charAt(0).toUpperCase()}
              </div>

              <div className="profile-info">
                <div className="profile-header-row">
                  <span className="profile-name">{profileData?.username}</span>
                  <span className={`badge ${rankClass}`} style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {profileData?.rankTitle || 'Novice'}
                  </span>
                </div>
                <div className="profile-email">{profileData?.email}</div>

                {/* Sélecteur de langue académique */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {t('profile.countryLang')}
                  </span>
                  <select
                    value={profileData?.preferredLang || 'fr'}
                    onChange={handleLangChange}
                    className="input"
                    style={{ padding: '4px 10px', fontSize: '12px', width: 'auto' }}
                  >
                    <option value="fr">Français (FR)</option>
                    <option value="en">English (EN)</option>
                    <option value="ja">日本語 (JA)</option>
                    <option value="ar">العربية (AR)</option>
                    <option value="pt">Português (PT)</option>
                    <option value="es">Español (ES)</option>
                    <option value="wo">Wolof (WO)</option>
                    <option value="zh">中文 (ZH)</option>
                  </select>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.8 }}>
                    {t('profile.feedAuto')}
                  </span>
                </div>

                {/* Progression XP */}
                <div className="xp-box">
                  <div className="xp-meta">
                    <span style={{ color: 'var(--muted)' }}>
                      {xpInfo.isMax ? t('profile.currentRank') : t('profile.xpProgress')}
                    </span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {formatNumber(profileData?.xpPoints ?? 0, lang)} XP
                      {!xpInfo.isMax && ` / ${formatNumber(xpInfo.next, lang)} XP (${xpInfo.percent}%)`}
                    </span>
                  </div>
                  <div className="xp-bar-bg">
                    <div className="xp-bar-fill" style={{ width: `${xpInfo.percent}%` }} />
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="btn btn-primary"
                  style={{ gap: '8px', padding: '10px 18px', fontSize: '13px' }}
                >
                  <Icon name="file-text" size={15} />
                  <span>{downloading ? t('profile.generating') : t('profile.portfolio')}</span>
                </button>

                <button
                  onClick={handleCopyPublicLink}
                  className="btn btn-outline"
                  style={{ gap: '8px', padding: '9px 18px', fontSize: '13px' }}
                  title="Partager un lien vérifiable avec des recruteurs"
                >
                  <Icon name={copied ? 'check' : 'user'} size={15} />
                  <span>{copied ? 'Lien public copié !' : 'Lien public recruteur'}</span>
                </button>
              </div>
            </div>

            {/* 3 Métriques clés */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <Icon name="award" size={16} />
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t('profile.xpTotal')}
                  </span>
                </div>
                <div className="stat-val">{formatNumber(profileData?.xpPoints ?? 0, lang)} XP</div>
                <div className="stat-sub">{t('profile.xpSub')}</div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <Icon name="book" size={16} />
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t('profile.skillsLabel')}
                  </span>
                </div>
                <div className="stat-val">{formatNumber(profileData?.skillsDeclarated?.length ?? 0, lang)}</div>
                <div className="stat-sub">{t('profile.skillsSub')}</div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <Icon name="trophy" size={16} />
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t('profile.rankLabel')}
                  </span>
                </div>
                <div className="stat-val">{profileData?.rankTitle || 'Novice'}</div>
                <div className="stat-sub">{t('profile.rankSub')}</div>
              </div>
            </div>

            {/* Deux colonnes : Compétences déclarées & Parcours des grades */}
            <div className="two-cols">
              {/* Compétences déclarées */}
              <div className="card-box">
                <h2 className="card-title">{t('profile.myPowers')}</h2>
                {profileData?.skillsDeclarated?.length > 0 ? (
                  <div className="chips">
                    {profileData.skillsDeclarated.map((skill) => (
                      <span key={skill} className={TAG_STYLES[skill] || 'chip'}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                    {t('profile.noSkill')}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '16px', lineHeight: 1.5 }}>
                  Les alertes d'entraide prioritaires vous sont envoyées pour ces matières.
                </p>
              </div>

              {/* Parcours des 5 grades */}
              <div className="card-box">
                <h2 className="card-title">{t('profile.rankJourney')}</h2>
                <div>
                  {RANK_MILESTONES.map((milestone) => {
                    const reached = (profileData?.xpPoints ?? 0) >= milestone.xp;
                    const isCurrent = profileData?.rankTitle === milestone.title;
                    return (
                      <div key={milestone.title} className="milestone-item">
                        <div
                          className={`milestone-dot ${isCurrent ? 'current' : reached ? 'done' : 'todo'}`}
                        >
                          {isCurrent ? '•' : reached ? <Icon name="check" size={13} strokeWidth={2.5} /> : ''}
                        </div>
                        <div style={{ flex: 1, fontSize: '13px', fontWeight: isCurrent ? '700' : '500', color: isCurrent ? 'var(--primary)' : 'inherit' }}>
                          {milestone.title}
                          {isCurrent && (
                            <span
                              className={`badge ${rankClass}`}
                              style={{ marginInlineStart: '8px', fontSize: '10px' }}
                            >
                              {t('profile.current')}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {formatNumber(milestone.xp, lang)} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Réputation multidimensionnelle par matière */}
            <div className="rep-box">
              <h2 className="card-title" style={{ marginBottom: '4px' }}>
                {t('profile.reputation')}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
                {t('profile.repHint')}
              </p>

              {!profileData?.skillsMetrics || profileData.skillsMetrics.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: 'var(--surface-alt)',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--surface)',
                      color: 'var(--muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <Icon name="award" size={20} />
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '600' }}>
                    {t('profile.noSession')}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                    {t('profile.helpFriend')}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {profileData.skillsMetrics.map((metric, i) => {
                    const sessionsDone = metric.helpCount || 0;
                    const seriousRate = metric.acceptedCount > 0
                      ? Math.round((metric.helpCount / metric.acceptedCount) * 100)
                      : 0;
                    const pedagogyRate = metric.helpCount > 0
                      ? (metric.totalStars / metric.helpCount).toFixed(1)
                      : '5.0';
                    const repPercent = Math.min(100, Math.round(((metric.reputationScore || 0) / 5) * 100));

                    return (
                      <div key={i} className="rep-card">
                        <div className="rep-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={TAG_STYLES[metric.skillTag] || 'chip'}>
                              {metric.skillTag}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                              {sessionsDone} {t('profile.sessionsDone')}
                            </span>
                          </div>
                          <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)' }}>
                            {formatNumber(metric.reputationScore, lang)} / 5.0
                          </div>
                        </div>

                        {/* Barre de réputation */}
                        <div className="xp-bar-bg" style={{ height: '6px' }}>
                          <div className="xp-bar-fill" style={{ width: `${repPercent}%` }} />
                        </div>

                        {/* 3 Facteurs certifiés */}
                        <div className="rep-factors">
                          <div className="factor-item">
                            <div className="factor-label">{t('chat.rep1').split(':')[0]}</div>
                            <div className="factor-val">{pedagogyRate} / 5</div>
                            <div className="factor-weight">Pondération 20%</div>
                          </div>

                          <div className="factor-item">
                            <div className="factor-label">{t('chat.rep2').split(':')[0]}</div>
                            <div className="factor-val">{seriousRate}%</div>
                            <div className="factor-weight">Pondération 60%</div>
                          </div>

                          <div className="factor-item">
                            <div className="factor-label">{t('chat.rep3').split(':')[0]}</div>
                            <div className="factor-val">
                              {metric.uniqueUsersHelped?.length ?? 0} {t('profile.students')}
                            </div>
                            <div className="factor-weight">Pondération 20%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
