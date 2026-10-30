import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Icon from '../../components/Icon';

/* Pays supportés -> langue de l'interface et du feed (aligné sur User.country / preferredLang backend) */
const COUNTRIES = [
  { code: 'CM', lang: 'fr', langLabel: 'Français' },
  { code: 'JP', lang: 'ja', langLabel: '日本語' },
  { code: 'MA', lang: 'ar', langLabel: 'العربية' },
  { code: 'BR', lang: 'pt', langLabel: 'Português' },
  { code: 'GB', lang: 'en', langLabel: 'English' },
  { code: 'ES', lang: 'es', langLabel: 'Español' },
  { code: 'SN', lang: 'wo', langLabel: 'Wolof' },
  { code: 'CN', lang: 'zh', langLabel: '中文' },
];

const SKILL_TAGS = [
  '#Java', '#Python', '#Réseaux', '#Linux', '#Droit', '#Web',
  '#Mathématiques', '#Physique', '#Comptabilité', '#Marketing', '#Anglais', '#Bases de données',
];

const MAX_SKILLS = 5;
const TONES = ['blue', 'violet', 'green'];

/** Nom du pays dans la langue courante (Intl), repli sur le français */
function countryName(code, lang) {
  for (const l of [lang, 'fr']) {
    try {
      const name = new Intl.DisplayNames([l], { type: 'region' }).of(code);
      if (name && name !== code) return name;
    } catch { /* langue non supportée par Intl */ }
  }
  return code;
}

/** Score de robustesse du mot de passe : 0 à 4 */
function passwordScore(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/\d/.test(pwd)) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

/** Applique la langue à toute l'interface (même logique que LanguageSwitcher / AuthContext) */
function applyLanguage(i18n, lang) {
  try {
    localStorage.setItem('eco-lang', lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  } catch { /* stockage indisponible */ }
}

export default function Register() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const uiLang = (i18n.language || 'fr').slice(0, 2);

  const initialCountry = COUNTRIES.find((c) => c.lang === uiLang)?.code || 'CM';

  const [step, setStep] = useState(1);
  const [country, setCountry] = useState(initialCountry);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    preferredLang: COUNTRIES.find((c) => c.code === initialCountry).lang,
  });
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdScore = passwordScore(formData.password);
  const pwdLabels = ['', t('authPage.pwdWeak'), t('authPage.pwdFair'), t('authPage.pwdGood'), t('authPage.pwdStrong')];

  const countryOptions = useMemo(
    () => COUNTRIES.map((c) => ({ ...c, name: countryName(c.code, uiLang) })),
    [uiLang],
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Le choix du pays bascule immédiatement toute l'interface dans la langue correspondante
  const handleCountryChange = (code) => {
    const found = COUNTRIES.find((c) => c.code === code);
    const lang = found ? found.lang : 'fr';
    setCountry(code);
    setFormData((f) => ({ ...f, preferredLang: lang }));
    applyLanguage(i18n, lang);
    setError('');
  };

  const toggleSkill = (tag) => {
    setError('');
    if (skills.includes(tag)) {
      setSkills(skills.filter((s) => s !== tag));
    } else if (skills.length < MAX_SKILLS) {
      setSkills([...skills, tag]);
    } else {
      setError(t('authPage.errMaxSkills', { max: MAX_SKILLS }));
    }
  };

  const addCustomSkill = () => {
    const raw = customSkill.trim();
    if (!raw) return;
    if (skills.length >= MAX_SKILLS) return setError(t('authPage.errMaxSkills', { max: MAX_SKILLS }));
    const tag = `#${raw.toLowerCase().replace(/\s+/g, '')}`;
    if (!skills.includes(tag)) setSkills([...skills, tag]);
    setCustomSkill('');
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (formData.password.length < 8) return setError(t('authPage.errPasswordLength'));
    if (formData.password !== formData.confirmPassword) return setError(t('authPage.errPasswordMatch'));
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        skillsDeclarated: skills,
        preferredLang: formData.preferredLang || 'fr',
        country,
      });
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || t('authPage.errGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: t('authPage.stepInfo'),   desc: step === 1 ? t('authPage.stepInfoDesc') : t('authPage.stepDone'), state: step === 1 ? 'current' : 'done' },
    { label: t('authPage.stepSkills'), desc: t('authPage.stepSkillsDesc'), state: step === 2 ? 'current' : 'todo' },
  ];

  const errorBox = error && (
    <div className="alert-error" role="alert">
      <Icon name="alert-circle" size={16} />
      <span>{error}</span>
    </div>
  );

  return (
    <AuthLayout
      title1={step === 1 ? t('authPage.registerTagline1') : t('authPage.skillsTagline1')}
      title2={step === 1 ? t('authPage.registerTagline2') : t('authPage.skillsTagline2')}
      subtitle={step === 1 ? t('authPage.registerSub') : t('authPage.skillsSub')}
      steps={steps}
    >
      <div className="step-bar" aria-hidden="true">
        <i className={step === 1 ? 'on' : ''} />
        <i className={step === 2 ? 'on' : ''} />
        <span>{t('authPage.stepOf', { current: step, total: 2 })}</span>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1}>
          <h2 className="form-title">{t('authPage.registerTitle')}</h2>
          <p className="form-sub">{t('authPage.registerSubtitle')}</p>
          {errorBox}

          <div className="field">
            <label className="label" htmlFor="username">{t('authPage.username')}</label>
            <input
              id="username" name="username" className="input" autoComplete="username"
              value={formData.username} onChange={handleChange}
              placeholder={t('authPage.usernamePh')} required minLength={3} maxLength={30}
            />
            <p className="helper">{t('authPage.usernameHelp')}</p>
          </div>

          <div className="field">
            <label className="label" htmlFor="email">{t('authPage.email')}</label>
            <input
              id="email" name="email" type="email" className="input" autoComplete="email"
              value={formData.email} onChange={handleChange}
              placeholder={t('authPage.emailPh')} required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">{t('authPage.password')}</label>
            <input
              id="password" name="password" type="password" className="input" autoComplete="new-password"
              value={formData.password} onChange={handleChange}
              placeholder={t('authPage.passwordMinPh')} required
            />
            {formData.password && (
              <>
                <div className={`pwd-bar s${pwdScore}`} aria-hidden="true"><i /><i /><i /><i /></div>
                <p className="helper">{pwdLabels[pwdScore]}</p>
              </>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="confirmPassword">{t('authPage.confirmPassword')}</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" className="input" autoComplete="new-password"
              value={formData.confirmPassword} onChange={handleChange}
              placeholder={t('authPage.confirmPh')} required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="country">{t('authPage.country')}</label>
            <select
              id="country" className="input" value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              {countryOptions.map((c) => (
                <option key={c.code} value={c.code}>{c.name} - {c.langLabel}</option>
              ))}
            </select>
            <p className="helper">{t('authPage.countryHelp')}</p>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            {t('authPage.continue')}
            <Icon name="arrow-right" size={16} />
          </button>

          <p className="form-alt">
            {t('authPage.hasAccount')}{' '}
            <Link to="/login">{t('authPage.loginBtn')}</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">{t('authPage.skillsTitle')}</h2>
          <p className="form-sub">{t('authPage.skillsSubtitle', { max: MAX_SKILLS })}</p>
          <div className="hint-box">{t('authPage.skillsHint')}</div>
          {errorBox}

          <div className="field">
            <span className="label">{t('authPage.subjects')}</span>
            <div className="chips">
              {[...SKILL_TAGS, ...skills.filter((s) => !SKILL_TAGS.includes(s))].map((tag) => {
                const idx = skills.indexOf(tag);
                return (
                  <button
                    key={tag} type="button" aria-pressed={idx !== -1}
                    className={`chip${idx !== -1 ? ` tone-${TONES[idx % TONES.length]}` : ''}`}
                    onClick={() => toggleSkill(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="customSkill">{t('authPage.otherSkill')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="customSkill" className="input" value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                placeholder={t('authPage.otherSkillPh')}
              />
              <button type="button" className="btn btn-secondary" onClick={addCustomSkill}>
                {t('authPage.add')}
              </button>
            </div>
            <p className="helper">{t('authPage.selectedCount', { count: skills.length, max: MAX_SKILLS })}</p>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? t('authPage.creating') : t('authPage.createBtn')}
          </button>

          <p className="form-alt">
            <button type="button" className="link-btn" onClick={() => { setError(''); setStep(1); }}>
              {t('authPage.back')}
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
