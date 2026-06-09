import { useState } from 'react';
import api from '../../api/axios';

function ForgotPassword({ onBack, onEmailSent }) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Введите email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('Код отправлен:', response.data);
      setIsSent(true);
      
      setTimeout(() => {
        if (onEmailSent) {
          onEmailSent(email);
        }
      }, 3000);
    } catch (error) {
      console.error('Ошибка:', error);
      setError(error.response?.data?.error || 'Ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-container">
            <span className="logo-text">TopTalk<span className="logo-corner"></span></span>
          </div>
          <div className="auth-form">
            <h2 className="auth-subtitle">Восстановление пароля</h2>
            <div className="info-box">
              На вашу почту отправлен код подтверждения.
            </div>
            <button className="btn-link" onClick={onBack}>На страницу входа</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">TopTalk<span className="logo-corner"></span></span>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-subtitle">Восстановление пароля</h2>
          {error && <div className="error-message" style={{ color: '#dc2626', textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
          <div className="input-group">
            <label>Ваш email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить'}
          </button>
          <button type="button" className="btn-link" onClick={onBack}>На страницу входа</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;