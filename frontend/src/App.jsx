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

function App() {
  const [view, setView] = useState('login');
  const [changePasswordStep, setChangePasswordStep] = useState(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null);
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

  const goToLogin = () => {
    setView('login');
    setLogin('');
    setPassword('');
    setEmail('');
    setForgotPasswordStep(null);
  };

  // Обработчики смены пароля (для авторизованных пользователей)
  const handleChangePasswordStart = () => setChangePasswordStep('step1');
  const handleEmailSent = () => setChangePasswordStep('step2');
  const handleChangePasswordComplete = () => {
    setChangePasswordStep(null);
    alert('Пароль успешно изменён!');
  };
  const handleBackFromChangePassword = () => setChangePasswordStep(null);

  // Обработчики восстановления пароля (для неавторизованных)
  const handleForgotPasswordStart = () => {
    setForgotPasswordStep('step1');
  };
  const handleForgotPasswordEmailSent = () => {
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

  // ========== СМЕНА ПАРОЛЯ (для авторизованных) ==========
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

  // ========== ВОССТАНОВЛЕНИЕ ПАРОЛЯ (для неавторизованных) ==========
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
              <button type="button" className="btn-link" onClick={handleForgotPasswordStart}>
                Забыли пароль?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;