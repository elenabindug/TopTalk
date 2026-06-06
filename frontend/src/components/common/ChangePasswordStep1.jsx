import { useState } from 'react';
import './ChangePassword.css';

function ChangePasswordStep1({ onBack, onLogout, onEmailSent }) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Введите email');
      return;
    }
    setIsSent(true);
    setTimeout(() => {
      if (onEmailSent) {
        onEmailSent();
      }
    }, 3000);
  };

  if (isSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-container">
            <span className="logo-text">TopTalk<span className="logo-corner"></span></span>
          </div>
          <div className="auth-form">
            <h2 className="auth-subtitle">Изменение пароля</h2>
            <div className="info-box">
              На вашу почту отправлена инструкция по изменению пароля.
            </div>
            <button className="btn-link" onClick={onBack}>Вернуться в настройки</button>
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
          <h2 className="auth-subtitle">Изменение пароля</h2>
          <div className="input-group">
            <label>Ваш email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Отправить</button>
          <button type="button" className="btn-link" onClick={onBack}>Вернуться в настройки</button>
          {onLogout && (
            <button type="button" className="btn-link" onClick={onLogout} style={{ color: '#dc2626' }}>
              Выйти из аккаунта
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordStep1;