import React, { useState, useEffect } from 'react';
import './App.css';
// Общие компоненты
import ChangePasswordStep1 from "./components/common/ChangePasswordStep1";
import ChangePasswordStep2 from "./components/common/ChangePasswordStep2";
// Студенческие компоненты
import StudentChat from "./components/student/StudentChat";
// Админские компоненты
import AdminChat from "./components/admin/AdminChat";

function App() {
  const [view, setView] = useState('login');
  const [changePasswordStep, setChangePasswordStep] = useState(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Проверяем сохраненного пользователя при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setUserRole(user.role);
    }
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      alert('Заполните все поля');
      return;
    }
    
    // Админ
    if (login === 'admin@toptalk.com' && password === 'admin123') {
      const adminUser = {
        id: 1,
        username: 'Admin',
        email: 'admin@toptalk.com',
        role: 'admin'
      };
      localStorage.setItem('token', 'fake-token-admin');
      localStorage.setItem('user', JSON.stringify(adminUser));
      setIsAuthenticated(true);
      setUserRole('admin');
    } 
    // Студент
    else {
      const studentUser = {
        id: Date.now(),
        username: login.split('@')[0] || login,
        email: login,
        role: 'student'
      };
      localStorage.setItem('token', 'fake-token-student');
      localStorage.setItem('user', JSON.stringify(studentUser));
      setIsAuthenticated(true);
      setUserRole('student');
    }
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Введите email');
      return;
    }
    setView('success');
  };

  const goToLogin = () => {
    setView('login');
    setLogin('');
    setPassword('');
    setEmail('');
  };

  const handleChangePasswordStart = () => setChangePasswordStep('step1');
  const handleEmailSent = () => setChangePasswordStep('step2');
  const handleChangePasswordComplete = () => {
    setChangePasswordStep(null);
    alert('Пароль успешно изменён!');
  };
  const handleBackFromChangePassword = () => setChangePasswordStep(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setChangePasswordStep(null);
  };

  // ========== СМЕНА ПАРОЛЯ ==========
  if (isAuthenticated && changePasswordStep === 'step1') {
    return <ChangePasswordStep1 
      onBack={handleBackFromChangePassword}
      onLogout={handleLogout}
      onEmailSent={handleEmailSent}
    />;
  }

  if (isAuthenticated && changePasswordStep === 'step2') {
    return <ChangePasswordStep2 
      onBack={() => setChangePasswordStep('step1')}
      onComplete={handleChangePasswordComplete}
    />;
  }

  // ========== ОСНОВНОЙ ЭКРАН (ЧАТ) ==========
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

  // ========== СТРАНИЦА ВХОДА ==========
  return (
    <div className="auth-container">
      {/* Подсказка с тестовыми аккаунтами */}
      <div className="auth-tooltip">
        <div className="tooltip-icon">ℹ️</div>
        <div className="tooltip-content">
          <h4>Тестовые аккаунты</h4>
          <div className="tooltip-item">
            <span className="tooltip-label">Студент:</span>
            <span className="tooltip-value">любой email / любой пароль</span>
          </div>
          <div className="tooltip-item">
            <span className="tooltip-label">Админ:</span>
            <span className="tooltip-value">admin@toptalk.com / admin123</span>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">
            TopTalk<span className="logo-corner"></span>
          </span>
        </div>

        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="input-group">
              <label>Email или логин</label>
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
              <button type="button" className="btn-link" onClick={() => setView('recovery')}>
                Забыли пароль?
              </button>
            </div>
          </form>
        )}

        {view === 'recovery' && (
          <form onSubmit={handleRecoverySubmit} className="auth-form">
            <h2 className="auth-subtitle">Восстановление пароля</h2>
            
            <div className="input-group">
              <label>Ваш email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">Далее</button>
            
            <button type="button" className="btn-link" onClick={goToLogin}>
              На страницу входа
            </button>
          </form>
        )}

        {view === 'success' && (
          <div className="auth-form">
            <h2 className="auth-subtitle">Восстановление пароля</h2>
            
            <div className="info-box">
              На вашу почту отправлена инструкция по восстановлению пароля.
            </div>
            
            <button type="button" className="btn-link" onClick={goToLogin}>
              На страницу входа
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;