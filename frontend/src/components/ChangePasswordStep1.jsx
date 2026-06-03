import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ChangePasswordStep1() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!oldPassword.trim()) {
      alert('Введите старый пароль');
      return;
    }
    if (newPassword.length < 6) {
      alert('Новый пароль должен быть не менее 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Новые пароли не совпадают');
      return;
    }

    // Здесь позже будет вызов API для смены пароля
    console.log('Старый пароль:', oldPassword);
    console.log('Новый пароль:', newPassword);

    // Переход на экран успеха
    navigate('/change-password/step2');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">
            TopTalk<span className="logo-corner"></span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-subtitle">Смена пароля</h2>

          <div className="input-group">
            <label>Старый пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Новый пароль</label>
            <input
              type="password"
              placeholder="не менее 6 символов"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Подтвердите новый пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Сменить пароль</button>

          <button
            type="button"
            className="btn-link"
            onClick={() => navigate('/settings')}
          >
            Вернуться в настройки
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordStep1;