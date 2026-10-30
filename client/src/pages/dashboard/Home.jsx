import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getRequests, acceptRequest, getMyRequests } from '../../services/api';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import { formatNumber } from '../../utils/format';

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pollingRef = useRef(null);

  const lang = (i18n.language || user?.preferredLang || 'fr').slice(0, 2);

  const fetchRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const l = (i18n.language || user?.preferredLang || 'fr').slice(0, 2);
      const res = await getRequests(page, 10, l);
      setRequests(res.data.requests || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      if (!silent) setError(t('home.empty'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, user?.preferredLang, i18n.language]);

  useEffect(() => {
    const onFeed = () => { fetchRequests(true); };
    window.addEventListener('eco-feed-refresh', onFeed);
    return () => window.removeEventListener('eco-feed-refresh', onFeed);
  }, [page, user?.preferredLang, i18n.language]);

  // Polling silencieux pour détecter l'acceptation d'une demande active de l'utilisateur
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const checkMyRequestStatus = async () => {
      try {
        const res = await getMyRequests(1, 50, lang);
        if (!isMounted) return;
        const myActive = res.data.requests?.find((req) => req.status === 'in-progress');
        if (myActive) {
          clearInterval(pollingRef.current);
          navigate(`/chat/${myActive._id}`);
        }
      } catch {}
    };

    checkMyRequestStatus();
    pollingRef.current = setInterval(checkMyRequestStatus, 15000);

    return () => {
      isMounted = false;
      clearInterval(pollingRef.current);
    };
  }, [user?.id, lang]);

  const handleAccept = async (requestId) => {
    try {
      await acceptRequest({ requestId });
      navigate(`/chat/${requestId}`);
    } catch (err) {
      alert(err.response?.data?.message || t('chat.sendErr'));
    }
  };

  const getTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return t('home.justNow');
    if (diff < 3600) return t('home.minutesAgo', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('home.hoursAgo', { count: Math.floor(diff / 3600) });
    return t('home.daysAgo', { count: Math.floor(diff / 86400) });
  };

  return (
    <DashboardLayout>
      {/* Header page */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', letterSpacing: '-0.02em' }}>
            {t('home.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {t('home.subtitle', { count: total })}
          </p>
        </div>
        <button
          onClick={() => navigate('/create-request')}
          className="btn btn-primary"
        >
          <Icon name="plus" size={16} />
          <span>{t('home.askHelp')}</span>
        </button>
      </div>

      {/* Cartes métriques académiques */}
      <div className="dash-metrics-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-label">{t('home.activeDemands')}</div>
          <div className="dash-metric-val">{formatNumber(total, lang)}</div>
        </div>
        <div className="dash-metric-card">
          <div className="dash-metric-label">{t('home.myXp')}</div>
          <div className="dash-metric-val">{formatNumber(user?.xpPoints ?? 0, lang)} XP</div>
        </div>
        <div className="dash-metric-card">
          <div className="dash-metric-label">{t('home.myRank')}</div>
          <div className="dash-metric-val">{user?.rankTitle || 'Novice'}</div>
        </div>
      </div>

      {error && (
        <div className="alert-error" role="alert" style={{ marginBottom: 20 }}>
          <Icon name="alert-circle" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Liste des demandes */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {t('home.empty')}
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {t('home.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="dash-table-card">
          <div className="dash-table-head">
            <div>#</div>
            <div>{t('home.request')}</div>
            <div className="dash-hide-mobile">{t('home.subject')}</div>
            <div className="dash-hide-mobile">{t('home.status')}</div>
            <div className="dash-hide-mobile">{t('home.published')}</div>
            <div style={{ textAlign: 'right' }}>{t('home.action')}</div>
          </div>

          {requests.map((req, index) => {
            const isRequester = req.requesterId === user?.id;
            const isMentor = req.mentorId === user?.id;
            const inProgress = req.status === 'in-progress';

            return (
              <div key={req._id} className="dash-table-row">
                <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 12 }}>
                  {(page - 1) * 10 + index + 1}
                </div>

                <div style={{ minWidth: 0, paddingRight: 16 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {req.title_display || req.title}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {req.description_display || req.description}
                  </div>
                  {req.title_translated && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
                      {t('common.translatedVia', { from: req.sourceLang, to: req.viewerLang, engine: req.engine })} • {t('common.original')}: {req.title_original}
                    </div>
                  )}
                </div>

                <div className="dash-hide-mobile">
                  <span className="badge badge-blue">
                    {req.skillTag}
                  </span>
                </div>

                <div className="dash-hide-mobile">
                  {inProgress ? (
                    <span className="badge badge-violet">
                      {t('home.inProgress')}
                    </span>
                  ) : (
                    <span className="badge badge-green">
                      {t('home.open')}
                    </span>
                  )}
                </div>

                <div className="dash-hide-mobile" style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {getTimeAgo(req.createdAt)}
                </div>

                <div style={{ textAlign: 'right' }}>
                  {inProgress ? (
                    isRequester || isMentor ? (
                      <button
                        onClick={() => navigate(`/chat/${req._id}`)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        <Icon name="message-square" size={13} />
                        <span>{t('home.chat')}</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                        {t('home.busy')}
                      </span>
                    )
                  ) : isRequester ? (
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                      {t('home.myRequest')}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      {t('home.help')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <Icon name="chevron-left" size={14} />
            <span>{t('common.previous')}</span>
          </button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {t('common.page')} {formatNumber(page, lang)} / {formatNumber(totalPages, lang)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <span>{t('common.next')}</span>
            <Icon name="chevron-right" size={14} />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
