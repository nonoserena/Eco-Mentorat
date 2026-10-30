import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { createRequest } from '../../services/api';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import { formatNumber } from '../../utils/format';

const OFFICIAL_TAGS = [
  '#java', '#python', '#reseau', '#linux', '#droit',
  '#web', '#mathematiques', '#physique', '#general'
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'fr').slice(0, 2);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);

  // Détection automatique intelligente basée sur le texte saisi
  const detectSkillTag = (text) => {
    const txt = (text || '').toLowerCase();
    if (txt.includes('java') || txt.includes('spring') || txt.includes('jee')) return '#java';
    if (txt.includes('python') || txt.includes('django') || txt.includes('flask') || txt.includes('numpy')) return '#python';
    if (txt.includes('reseau') || txt.includes('réseau') || txt.includes('cisco') || txt.includes('ip') || txt.includes('vlsm')) return '#reseau';
    if (txt.includes('linux') || txt.includes('ubuntu') || txt.includes('bash') || txt.includes('shell')) return '#linux';
    if (txt.includes('droit') || txt.includes('loi') || txt.includes('juridique') || txt.includes('code civil')) return '#droit';
    if (txt.includes('html') || txt.includes('css') || txt.includes('react') || txt.includes('javascript') || txt.includes('web')) return '#web';
    if (txt.includes('math') || txt.includes('algebre') || txt.includes('intégrale') || txt.includes('calcul')) return '#mathematiques';
    if (txt.includes('physique') || txt.includes('optique') || txt.includes('mecanique')) return '#physique';
    return '#general';
  };

  const autoDetectedTag = detectSkillTag(`${title} ${description}`);
  const currentTag = selectedTag || autoDetectedTag;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() && !description.trim()) {
      return setError(t('create.errorEmpty') || 'Veuillez décrire votre problème.');
    }

    const finalTitle = title.trim() || (description.length > 80 ? description.substring(0, 80) + '...' : description);
    const finalDescription = description.trim() || title.trim();

    if (finalDescription.length < 10) {
      return setError(t('create.errorShort') || 'La description doit contenir au moins 10 caractères.');
    }

    setLoading(true);
    setError('');

    try {
      await createRequest({
        title: finalTitle,
        description: finalDescription,
        skillTag: currentTag
      });
      navigate('/home');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || '';

      // Gestion du cas de limitation / blocage anti-passager clandestin (403)
      if (status === 403) {
        setBlocked(true);
      } else if (message.includes('interdites') || message.includes('financières')) {
        setError(message || t('create.errorForbidden') || 'Les transactions ou coordonnées privées sont interdites.');
      } else {
        setError(message || t('create.errorGeneric') || 'Erreur lors de la publication.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Écran d'incitation à aider ses pairs si quotas de demandes épuisés (logique 403)
  if (blocked) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 520, margin: '40px auto 0', textAlign: 'center' }}>
          <div className="card" style={{ padding: '36px 32px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: 'var(--blue-light)',
              color: 'var(--blue)', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 16
            }}>
              <Icon name="users" size={26} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>
              {t('createPage.blockedTitle') || "C'est ton tour d'aider !"}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              {t('create.blockedDesc1') || "Tu as beaucoup sollicité la communauté récemment."}
              <br />
              {t('create.blockedDesc2') || "Débloque de nouveaux camarades pour réactiver tes demandes."}
            </p>

            <button
              onClick={() => navigate('/home')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: 14 }}
            >
              <span>{t('createPage.seeRequests') || "Voir les demandes d'aide"}</span>
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', letterSpacing: '-0.02em' }}>
            {t('create.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {t('create.subtitle')}
          </p>
        </div>

        {error && (
          <div className="alert-error" role="alert" style={{ marginBottom: 20 }}>
            <Icon name="alert-circle" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
          {/* Sujet */}
          <div className="field">
            <label className="label" htmlFor="req-title">
              {t('home.request')} / Sujet
            </label>
            <input
              id="req-title"
              type="text"
              className="input"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="Ex. : Problème avec la récursion en langage C"
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div className="field">
            <label className="label" htmlFor="req-desc">
              Description détaillée
            </label>
            <textarea
              id="req-desc"
              className="input"
              rows={5}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(''); }}
              placeholder={t('create.placeholder')}
              maxLength={1000}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              {/* Badge matière détectée */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                <span>{t('create.detected')}</span>
                <span className="badge badge-blue">
                  {currentTag}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {formatNumber(description.length, lang)} / 1000
              </span>
            </div>
          </div>

          {/* Ajustement manuel de la matière */}
          <div className="field">
            <label className="label" htmlFor="req-tag">
              Matière (ajustement manuel si nécessaire)
            </label>
            <select
              id="req-tag"
              className="input"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">Détection automatique ({autoDetectedTag})</option>
              {OFFICIAL_TAGS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!title.trim() && !description.trim())}
              style={{ flex: 1, padding: '12px 20px' }}
            >
              {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
              <span>{loading ? t('create.publishing') : t('create.submit')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="btn btn-secondary"
              style={{ padding: '12px 20px' }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
