import { useState } from 'react';
import api from '../../api/axios';

function ChangePasswordStep2({ onBack, onComplete, email }) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      alert('Код должен состоять из 6 цифр');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Новый пароль должен быть не менее 6 символов');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/auth/reset-password', {
        email: email,
        code: code,
        newPassword: newPassword
      });
      
      console.log('Пароль изменён:', response.data);
      setIsSuccess(true);
      
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 2000);
    } catch (error) {
      console.error('Ошибка:', error);
      setError(error.response?.data?.error || 'Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-container">
            <span className="logo-text">TopTalk<span className="logo-corner"></span></span>
          </div>
          <div className="auth-form">
            <h2 className="auth-subtitle">Пароль успешно изменён!</h2>
            <div className="info-box">
              Ваш пароль был успешно изменён.
            </div>
            <button className="btn-link" onClick={onBack}>Вернуться в настройки</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ minHeight: '600px' }}>
        <div className="logo-container">
          <span className="logo-text">TopTalk<span className="logo-corner"></span></span>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '15px' }}>
          <h2 className="auth-subtitle">Изменение пароля</h2>
          <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '10px', textAlign: 'center' }}>
            Введите код из письма и новый пароль
          </p>
          
          {error && <div className="error-message" style={{ color: '#dc2626', textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
          
          <div className="input-group" style={{ marginBottom: '5px' }}>
            <label>Код подтверждения</label>
            <input 
              type="text" 
              placeholder="123456"
              value={code} 
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              required 
            />
          </div>

          <div className="input-group" style={{ marginBottom: '5px' }}>
            <label>Новый пароль</label>
            <input 
              type="password" 
              placeholder="не менее 6 символов"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group" style={{ marginBottom: '5px' }}>
            <label>Подтвердите пароль</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Отправка...' : 'Сменить пароль'}
          </button>
          <button type="button" className="btn-link" onClick={onBack} style={{ fontSize: '16px', marginTop: '5px' }}>Назад</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordStep2;