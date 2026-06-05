import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPasswordStep2() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка кода (пока заглушка — 6 цифр)
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      alert('Код должен состоять из 6 цифр');
      return;
    }
    
    // Проверка пароля
    if (newPassword.length < 6) {
      alert('Новый пароль должен быть не менее 6 символов');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    
    // Имитация отправки (позже заменишь на реальный API)
    try {
      console.log('Код:', code);
      console.log('Новый пароль:', newPassword);
      
      // Показываем экран успеха
      setIsSuccess(true);
      
      // Через 2 секунды перенаправляем на логин
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      alert('Ошибка при смене пароля. Попробуйте позже.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">
            TopTalk<span className="logo-corner"></span>
          </span>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-subtitle">Восстановление пароля</h2>
            <p className="auth-description">
              Введите код из письма и новый пароль
            </p>
            
            <div className="input-group">
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

            <div className="input-group">
              <label>Новый пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Подтвердите пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">Сменить пароль</button>
            
            <div className="auth-links">
              <Link to="/login" className="btn-link">Вернуться ко входу</Link>
            </div>
          </form>
        ) : (
          <div className="auth-form">
            <h2 className="auth-subtitle">Пароль успешно изменён!</h2>
            
            <div className="info-box">
              <p>Ваш пароль был успешно изменён.</p>
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b6b6b' }}>
                Перенаправление на страницу входа...
              </p>
            </div>
            
            <Link to="/login" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              На страницу входа
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordStep2;