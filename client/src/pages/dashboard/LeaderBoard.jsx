import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getLeaderboard } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { formatNumber } from '../../utils/format';
import Icon from '../../components/Icon';

const SKILL_TAGS = ['', '#java', '#reseau', '#linux', '#python', '#droit', '#web', '#mathematiques', '#physique'];

export default function Leaderboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = (user?.preferredLang || i18n.language || 'fr').slice(0, 2);

  const [leaders, setLeaders] = useState([]);
  const [skill, setSkill] = useState('');
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await getLeaderboard(skill);
      setLeaders(res.data.leaderboard || []);
      setMode(res.data.mode || '');
    } catch {
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [skill]);

  const scoreText = (l) => {
    return skill
      ? `${formatNumber(l?.reputationScore, lang)} / 5`
      : `${formatNumber(l?.xpPoints, lang)} XP`;
  };

  const getRankBadgeClass = (rankTitle) => {
    const map = {
      'Novice': 'grade-novice',
      'Apprenti': 'grade-apprenti',
      'Confirmé': 'grade-confirme',
      'Expert': 'grade-expert',
      'Légende': 'grade-legende',
    };
    return map[rankTitle] || 'grade-novice';
  };

  // Top 3 pour le podium olympique
  const first = leaders[0];
  const second = leaders[1];
  const third = leaders[2];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', letterSpacing: '-0.02em' }}>
            {t('leaderboard.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {mode || t('leaderboard.champion')}
          </p>
        </div>

        {/* ── BARRE DE FILTRES MATIÈRES ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 32 }}>
          {SKILL_TAGS.map((tag) => (
            <button
              key={tag || 'general'}
              onClick={() => setSkill(tag)}
              className={`btn btn-sm ${skill === tag ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 6, fontSize: 12, padding: '7px 14px' }}
            >
              {tag ? tag : t('leaderboard.general')}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 24, height: 24 }} />
          </div>
        ) : leaders.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              {t('leaderboard.empty')}
            </p>
          </div>
        ) : (
          <>
            {/* ── PODIUM REMISE DE PRIX (2e - 1er surélevé - 3e) ── */}
            {leaders.length >= 3 && (
              <div className="podium-container">

                {/* 2ème Place : ARGENT */}
                <div className="podium-card is-silver">
                  <div className="trophy-badge is-silver">
                    <Icon name="trophy" size={24} color="#64748B" />
                  </div>
                  <span className="rank-pill is-silver">2e ARGENT</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>
                    {second.username}
                  </div>
                  <div>
                    <span className={`badge ${getRankBadgeClass(second.rankTitle)}`}>
                      {second.rankTitle || 'Novice'}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', marginTop: 10 }}>
                    {scoreText(second)}
                  </div>
                </div>

                {/* 1ère Place : OR (Surélevée) */}
                <div className="podium-card is-gold">
                  <div className="trophy-badge is-gold">
                    <Icon name="trophy" size={28} color="#D97706" />
                  </div>
                  <span className="rank-pill is-gold">1er OR</span>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>
                    {first.username}
                  </div>
                  <div>
                    <span className={`badge ${getRankBadgeClass(first.rankTitle)}`}>
                      {first.rankTitle || 'Novice'}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue)', marginTop: 10 }}>
                    {scoreText(first)}
                  </div>
                </div>

                {/* 3ème Place : BRONZE */}
                <div className="podium-card is-bronze">
                  <div className="trophy-badge is-bronze">
                    <Icon name="trophy" size={24} color="#C2410C" />
                  </div>
                  <span className="rank-pill is-bronze">3e BRONZE</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>
                    {third.username}
                  </div>
                  <div>
                    <span className={`badge ${getRankBadgeClass(third.rankTitle)}`}>
                      {third.rankTitle || 'Novice'}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', marginTop: 10 }}>
                    {scoreText(third)}
                  </div>
                </div>

              </div>
            )}

            {/* ── TABLEAU COMPLET DES MENTORS ── */}
            <div className="dash-table-card">
              <div style={{
                display: 'grid', gridTemplateColumns: '70px 1fr 140px 140px',
                padding: '12px 20px', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)',
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)'
              }}>
                <div>{t('leaderboard.rank')}</div>
                <div>{t('leaderboard.mentor')}</div>
                <div>{t('leaderboard.grade')}</div>
                <div style={{ textAlign: 'right' }}>{t('leaderboard.score')}</div>
              </div>

              {leaders.map((leader, index) => {
                const rankNum = index + 1;
                let trophyColor = null;
                if (rankNum === 1) trophyColor = '#D97706';
                else if (rankNum === 2) trophyColor = '#64748B';
                else if (rankNum === 3) trophyColor = '#B45309';

                return (
                  <div
                    key={leader._id}
                    style={{
                      display: 'grid', gridTemplateColumns: '70px 1fr 140px 140px',
                      padding: '14px 20px', borderBottom: index < leaders.length - 1 ? '1px solid var(--border)' : 'none',
                      alignItems: 'center', fontSize: 13,
                      background: leader._id === user?.id ? 'var(--blue-light)' : 'transparent'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: trophyColor || 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {trophyColor ? (
                        <Icon name="trophy" size={14} color={trophyColor} />
                      ) : (
                        <span style={{ width: 14 }} />
                      )}
                      <span>{rankNum}</span>
                    </div>

                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {leader.username}
                      {leader._id === user?.id && (
                        <span style={{ fontSize: 11, color: 'var(--accent)', marginInlineStart: 6, fontWeight: 500 }}>
                          ({t('profile.current')})
                        </span>
                      )}
                    </div>

                    <div>
                      <span className={`badge ${getRankBadgeClass(leader.rankTitle)}`}>
                        {leader.rankTitle || 'Novice'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--blue)' }}>
                      {scoreText(leader)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
