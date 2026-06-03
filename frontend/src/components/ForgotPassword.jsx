import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Введите email');
      return;
    }
    
    // Имитация отправки (позже заменишь на реальный API)
    try {
      // Здесь будет вызов API для восстановления пароля
      console.log('Отправка инструкции на email:', email);
      
      // Показываем экран успеха
      setIsSubmitted(true);
      
      // Через 3 секунды перенаправляем на логин
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      alert('Ошибка при отправке. Попробуйте позже.');
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

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-subtitle">Восстановление пароля</h2>
            
            <div className="input-group">
              <label>Ваш email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">Отправить</button>
            
            <div className="auth-links">
              <Link to="/login" className="btn-link">Вернуться ко входу</Link>
            </div>
          </form>
        ) : (
          <div className="auth-form">
            <h2 className="auth-subtitle">Проверьте почту</h2>
            
            <div className="info-box">
              <p>На вашу почту <strong>{email}</strong> отправлена инструкция по восстановлению пароля.</p>
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b6b6b' }}>
                Перенаправление на страницу входа через несколько секунд...
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

export default ForgotPassword;