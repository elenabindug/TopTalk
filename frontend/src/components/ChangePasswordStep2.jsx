import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ChangePasswordStep2() {
  const navigate = useNavigate();

  useEffect(() => {
    // Через 3 секунды перенаправляем в настройки
    const timer = setTimeout(() => {
      navigate('/settings');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">
            TopTalk<span className="logo-corner"></span>
          </span>
        </div>

        <div className="auth-form">
          <h2 className="auth-subtitle">Пароль успешно изменён!</h2>

          <div className="info-box">
            <p>Ваш пароль был успешно изменён.</p>
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b6b6b' }}>
              Перенаправление в настройки...
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/settings')}
            style={{ textAlign: 'center', textDecoration: 'none' }}
          >
            Вернуться в настройки
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordStep2;