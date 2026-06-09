import React, { useState, useEffect } from 'react';
import './App.css';
// Общие компоненты
import ChangePasswordStep1 from "./components/common/ChangePasswordStep1";
import ChangePasswordStep2 from "./components/common/ChangePasswordStep2";
import ForgotPassword from "./components/common/ForgotPassword";
import ForgotPasswordStep2 from "./components/common/ForgotPasswordStep2";
// Студенческие компоненты
import StudentChat from "./components/student/StudentChat";
// Админские компоненты
import AdminChat from "./components/admin/AdminChat";
import api from './api/axios';

function App() {
  const [view, setView] = useState('login');
  const [changePasswordStep, setChangePasswordStep] = useState(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [changeEmail, setChangeEmail] = useState('');

  // Проверка токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAuthenticated(true);
      setUserRole(user.role || 'student');
    }
  }, []);

  // Реальный вход через API
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      alert('Заполните все поля');
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: login,
        password: password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setIsAuthenticated(true);
      setUserRole(response.data.user.role);
    } catch (error) {
      console.error('Ошибка входа:', error);
      alert(error.response?.data?.error || 'Ошибка при входе');
    }
  };

  const goToLogin = () => {
    setView('login');
    setLogin('');
    setPassword('');
    setForgotPasswordStep(null);
  };

  const handleChangePasswordStart = () => setChangePasswordStep('step1');
  const handleChangeEmailSent = (email) => {
    setChangeEmail(email);
    setChangePasswordStep('step2');
  };
  const handleChangePasswordComplete = () => {
    setChangePasswordStep(null);
    alert('Пароль успешно изменён!');
  };
  const handleBackFromChangePassword = () => setChangePasswordStep(null);

  const handleForgotPasswordStart = () => setForgotPasswordStep('step1');
  const handleForgotPasswordEmailSent = (email) => {
    setForgotEmail(email);
    setForgotPasswordStep('step2');
  };
  const handleForgotPasswordComplete = () => {
    setForgotPasswordStep(null);
    setView('login');
    alert('Пароль успешно восстановлен! Войдите с новым паролем.');
  };
  const handleBackFromForgotPassword = () => {
    setForgotPasswordStep(null);
    setView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setChangePasswordStep(null);
  };

  // Смена пароля (авторизованные)
  if (isAuthenticated && changePasswordStep === 'step1') {
    return <ChangePasswordStep1 
      onBack={handleBackFromChangePassword}
      onLogout={handleLogout}
      onEmailSent={handleChangeEmailSent}
    />;
  }
  if (isAuthenticated && changePasswordStep === 'step2') {
    return <ChangePasswordStep2 
      onBack={() => setChangePasswordStep('step1')}
      onComplete={handleChangePasswordComplete}
      email={changeEmail}
    />;
  }

  // Восстановление пароля (неавторизованные)
  if (forgotPasswordStep === 'step1') {
    return <ForgotPassword 
      onBack={handleBackFromForgotPassword}
      onEmailSent={handleForgotPasswordEmailSent}
    />;
  }
  if (forgotPasswordStep === 'step2') {
    return <ForgotPasswordStep2 
      onBack={() => setForgotPasswordStep('step1')}
      onComplete={handleForgotPasswordComplete}
      email={forgotEmail}
    />;
  }

  // Основной экран (чат)
  if (isAuthenticated) {
    if (userRole === 'admin') {
      return <AdminChat 
        onLogout={handleLogout}
        onChangePassword={handleChangePasswordStart}
      />;
    } else {
      return <StudentChat 
        onLogout={handleLogout}
        onChangePassword={handleChangePasswordStart}
      />;
    }
  }

  // Страница входа
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">TopTalk<span className="logo-corner"></span></span>
        </div>
        <form onSubmit={handleLoginSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input 
              type="text" 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>
          <div className="input-group">
            <label>Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Войти</button>
          <div className="auth-links">
            <button type="button" className="btn-link" onClick={handleForgotPasswordStart}>
              Забыли пароль?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;