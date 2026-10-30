import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getHistory, getMyRequests, getMyHelps } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatDateTime } from '../../utils/format';
import Icon from '../../components/Icon';

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

export default function History() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = (i18n.language || user?.preferredLang || 'fr').slice(0, 2);

  const [activeTab, setActiveTab] = useState('general');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const TABS = [
    { id: 'general', label: t('history.tabGeneral'), icon: 'file-text' },
    { id: 'requests', label: t('history.tabRequests'), icon: 'help-circle' },
    { id: 'helps', label: t('history.tabHelps'), icon: 'award' },
  ];

  const STATUS_CONFIG = {
    open: {
      label: t('history.open'),
      cls: 'badge-blue',
    },
    'in-progress': {
      label: t('history.inProgress'),
      cls: 'badge-violet',
    },
    completed: {
      label: t('history.completed'),
      cls: 'badge-green',
    },
    contested: {
      label: t('history.contested'),
      cls: 'badge-error',
    },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'general') res = await getHistory(page, 15);
      if (activeTab === 'requests') res = await getMyRequests(page, 15);
      if (activeTab === 'helps') res = await getMyHelps(page, 15);

      setData(res.data.requests || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setData([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const formatDate = (d) => formatDateTime(d, lang);

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="history-stars" aria-label={`${rating} sur 5`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={s <= rating ? '' : 'empty'}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600', marginInlineStart: '4px' }}>
          {formatNumber(rating, lang)} / 5
        </span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* En-tête */}
        <div style={{ marginBottom: '24px' }}>
          <h1 className="page-title">{t('history.title')}</h1>
          <p className="page-sub">{t('history.subtitle')}</p>
        </div>

        {/* 3 Onglets sobres sans emoji */}
        <div className="history-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`history-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              <Icon name={tab.icon} size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Compteur de résultats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {formatNumber(total, lang)} {t('history.found')}
          </span>
        </div>

        {/* Contenu / État de chargement */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: '28px', height: '28px', color: 'var(--primary)' }} />
          </div>
        ) : data.length === 0 ? (
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
              <Icon
                name={activeTab === 'general' ? 'file-text' : activeTab === 'requests' ? 'help-circle' : 'award'}
                size={22}
              />
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: '500' }}>
              {activeTab === 'general' && t('history.emptyGeneral')}
              {activeTab === 'requests' && t('history.emptyRequests')}
              {activeTab === 'helps' && t('history.emptyHelps')}
            </p>
          </div>
        ) : (
          <div>
            {data.map((req) => {
              const statusInfo = STATUS_CONFIG[req.status] || STATUS_CONFIG.open;
              const tagStyle = TAG_STYLES[req.skillTag] || 'chip';
              const isRequester = req.requesterId === user?.id;
              const isMentor = req.mentorId === user?.id;

              return (
                <div key={req._id} className="history-card">
                  <div className="history-card-main">
                    <div className="history-tags">
                      <span className={tagStyle} style={{ padding: '3px 8px', fontSize: '11px' }}>
                        {req.skillTag}
                      </span>
                      <span className={`badge ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                      {activeTab === 'general' && isRequester && (
                        <span className="badge badge-blue">
                          {t('history.myRequest')}
                        </span>
                      )}
                      {activeTab === 'general' && isMentor && (
                        <span className="badge badge-green">
                          {t('history.helped')}
                        </span>
                      )}
                    </div>

                    <h2 className="history-title">
                      {req.title_display || req.title}
                    </h2>
                    <p className="history-desc">
                      {req.description_display || req.description}
                    </p>

                    {req.status === 'completed' && req.rating && renderStars(req.rating)}
                  </div>

                  <div className="history-meta">
                    <div>{formatDate(req.createdAt)}</div>
                    {req.status === 'completed' && req.updatedAt && (
                      <div style={{ marginTop: '4px', opacity: 0.8, fontSize: '11px' }}>
                        {t('history.finishedOn')} {formatDate(req.updatedAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination sobre */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '28px',
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <Icon name="chevron-left" size={14} />
              <span>{t('common.previous')}</span>
            </button>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                padding: '8px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            >
              {t('common.page')} {formatNumber(page, lang)} / {formatNumber(totalPages, lang)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-outline"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <span>{t('common.next')}</span>
              <Icon name="chevron-right" size={14} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
