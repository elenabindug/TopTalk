import React, { useState } from 'react';
import './App.css';
import Chat from "./components/Chat";
import ChangePasswordStep1 from './components/ChangePasswordStep1';
import ChangePasswordStep2 from './components/ChangePasswordStep2';

// Внутри <Routes>:
<Route path="/change-password" element={<ChangePasswordStep1 />} />
<Route path="/change-password/step2" element={<ChangePasswordStep2 />} />

function App() {
  const [view, setView] = useState('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Обработчик входа
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      alert('Заполните все поля');
      return;
    }
    console.log('Логин:', login, 'Пароль:', password);
    // Здесь позже будет вызов API
    setIsAuthenticated(true);
  };

  // Передаём setIsAuthenticated в Chat
if (isAuthenticated) {
  return <Chat onLogout={() => setIsAuthenticated(false)} />;
}
  // Обработчик восстановления (шаг 1)
  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Введите email');
      return;
    }
    console.log('Почта для восстановления:', email);
    setView('success');
  };

  // Сброс формы при возврате на логин
  const goToLogin = () => {
    setView('login');
    setLogin('');
    setPassword('');
    setEmail('');
  };

  // Если авторизован — показываем чат
  if (isAuthenticated) {
    return <Chat userName={login} />;
  }

  // Страницы авторизации
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Логотип */}
        <div className="logo-container">
          <span className="logo-text">
            TopTalk<span className="logo-corner"></span>
          </span>
        </div>

        {/* ЭКРАН 1: ВХОД */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="input-group">
              <label>Ваш логин</label>
              <input 
                type="text" 
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Ваш пароль</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">Войти</button>
            
            <div className="auth-links">
              <button type="button" className="btn-link" onClick={() => setView('recovery')}>
                Забыли пароль?
              </button>
              <button type="button" className="btn-link" onClick={() => alert('Переход на регистрацию')}>
                Регистрация
              </button>
            </div>
          </form>
        )}

        {/* ЭКРАН 2: ВОССТАНОВЛЕНИЕ (ВВОД EMAIL) */}
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

        {/* ЭКРАН 3: УСПЕШНАЯ ОТПРАВКА */}
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