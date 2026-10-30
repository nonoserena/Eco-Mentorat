import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Icon from '../../components/Icon';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // AuthContext.login synchronise aussi la langue avec user.preferredLang
      await login(formData.email, formData.password);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || t('authPage.errGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title1={t('authPage.loginTagline1')}
      title2={t('authPage.loginTagline2')}
      subtitle={t('authPage.loginSub')}
    >
      <h2 className="form-title">{t('authPage.loginTitle')}</h2>
      <p className="form-sub">{t('authPage.loginSubtitle')}</p>

      {error && (
        <div className="alert-error" role="alert">
          <Icon name="alert-circle" size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate={false}>
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
            id="password" name="password" type="password" className="input" autoComplete="current-password"
            value={formData.password} onChange={handleChange}
            placeholder={t('authPage.passwordPh')} required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? t('authPage.connecting') : t('authPage.loginBtn')}
        </button>
      </form>

      <p className="form-alt">
        {t('authPage.noAccount')}{' '}
        <Link to="/register">{t('authPage.createAccount')}</Link>
      </p>
    </AuthLayout>
  );
}
