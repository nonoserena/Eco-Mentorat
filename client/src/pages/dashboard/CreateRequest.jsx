import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { createRequest, scanExercisePhoto, autoTagRequest, voiceTranscribeRequest } from '../../services/api';
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

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);

  // Détection automatique locale de secours
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

  // 1. Automatisation SAM 3.1 + Muse Spark Vision : scan de photo d'exercice
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return setError('Image trop volumineuse (max 5 Mo).');
    }

    setScanning(true);
    setError('');
    setAiNote('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await scanExercisePhoto({
          imageBase64: base64Data,
          mimeType: file.type || 'image/jpeg'
        });

        if (res.data?.data) {
          const { title: aiTitle, description: aiDesc, suggestedTag } = res.data.data;
          if (aiTitle) setTitle(aiTitle);
          if (aiDesc) setDescription(aiDesc);
          if (suggestedTag && OFFICIAL_TAGS.includes(suggestedTag.toLowerCase())) {
            setSelectedTag(suggestedTag.toLowerCase());
          }
          setAiNote("Exercice segmenté (SAM 3.1) et transcrit par Meta Muse Spark Vision");
        } else {
          setAiNote("Photo analysée par SAM 3.1. Veuillez préciser l'énoncé ci-dessous.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Échec de l'analyse visuelle par l'agent Meta.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 2. Automatisation Muse Voice Transcribe (muse-voice-transcribe-1.0) : dictée vocale 2G
  const handleVoiceToggle = () => {
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("La capture vocale nécessite un navigateur compatible (Chrome / Edge).");
      return;
    }

    setError('');
    setAiNote('');
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-SA' : 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognition.onresult = async (event) => {
      const rawText = event.results?.[0]?.[0]?.transcript || '';
      if (!rawText) return;
      try {
        const res = await voiceTranscribeRequest({ rawTranscript: rawText, lang });
        const finalText = res.data?.data?.text || rawText;
        setDescription((prev) => (prev ? `${prev} ${finalText}` : finalText));
        if (!title.trim()) {
          setTitle(finalText.length > 70 ? `${finalText.slice(0, 70)}...` : finalText);
        }
        setAiNote("Dictée transcrite et structurée via Meta Muse Voice Transcribe (muse-voice-transcribe-1.0)");
      } catch {
        setDescription((prev) => (prev ? `${prev} ${rawText}` : rawText));
      }
    };

    recognition.start();
  };

  // 3. Automatisation Muse Glimmer (muse-glimmer-1.0) : classification & auto-tagging
  const handleAiAutoTag = async () => {
    if (!title.trim() && !description.trim()) return;
    setTagging(true);
    setError('');
    try {
      const res = await autoTagRequest({ title, description });
      if (res.data?.suggestedTag) {
        const tag = res.data.suggestedTag.toLowerCase();
        if (OFFICIAL_TAGS.includes(tag)) {
          setSelectedTag(tag);
          setAiNote(`Matière identifiée par Meta Muse Glimmer : ${tag} (Niveau ${res.data.difficulty || 'Intermédiaire'})`);
        }
      }
    } catch {
      // repli transparent sur la regex locale
    } finally {
      setTagging(false);
    }
  };

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

      if (status === 403) {
        setBlocked(true);
      } else {
        setError(message || t('create.errPublish') || 'Une erreur est survenue lors de la publication.');
      }
    } finally {
      setLoading(false);
    }
  };

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

        {aiNote && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            marginBottom: 20, fontSize: 13, background: 'var(--blue-light)',
            color: 'var(--blue)', border: '1px solid var(--border)', borderRadius: 6
          }}>
            <Icon name="check-circle" size={16} />
            <span>{aiNote}</span>
          </div>
        )}

        {/* Barre d'acquisition multimodale Meta AI (SAM 3.1 + Muse Spark Vision + Muse Voice Transcribe) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 20 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
            accept="image/*"
            capture="environment"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="btn btn-outline"
            style={{
              padding: '12px 14px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 600, borderStyle: 'dashed'
            }}
          >
            {scanning ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                <span>SAM 3.1 + Muse Spark Vision...</span>
              </>
            ) : (
              <>
                <Icon name="camera" size={16} />
                <span>Scanner un exercice (SAM 3.1 + Vision)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleVoiceToggle}
            className={recording ? 'btn btn-primary' : 'btn btn-outline'}
            style={{
              padding: '12px 14px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 600, borderStyle: recording ? 'solid' : 'dashed'
            }}
          >
            <Icon name="mic" size={16} />
            <span>
              {recording ? 'Écoute en cours (Cliquer pour arrêter)...' : 'Dicter en vocal 2G (Muse Voice Transcribe)'}
            </span>
          </button>
        </div>

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
              onBlur={handleAiAutoTag}
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
              onBlur={handleAiAutoTag}
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
                {tagging && <span className="spinner" style={{ width: 12, height: 12 }} />}
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
