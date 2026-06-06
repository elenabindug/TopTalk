import { useState } from 'react';
import './SettingsScreen.css';

const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ChangePasswordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <line x1="12" y1="15" x2="12" y2="18"/>
  </svg>
);

function SettingsScreen({ onBack, onLogout, onProfile, onChangePassword }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="settings-screen">
      {/* ЛЕВАЯ ПАНЕЛЬ (СЕРАЯ ПЛАШКА) */}
      <aside className="settings-sidebar">
        <div className="settings-sidebar-header">
          <button className="settings-icon-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <BurgerIcon />
          </button>
          <button className="settings-profile-btn-sidebar" onClick={onProfile}>
            Настройки профиля
          </button>
        </div>
      </aside>

      {/* ВЫПАДАЮЩЕЕ МЕНЮ (ПОВЕРХ) */}
      {isMenuOpen && (
        <div className="settings-floating-menu">
          <div className="settings-floating-menu-header">
            <div className="settings-user-avatar"></div>
            <div className="settings-user-info">
              <span className="settings-user-nickname">Пользователь</span>
            </div>
          </div>
          <nav className="settings-floating-menu-nav">
            <button className="settings-floating-menu-item" onClick={() => alert('Объявления в разработке')}>
              <span className="settings-menu-icon"><InfoIcon /></span>
              Объявления
            </button>
            <button className="settings-floating-menu-item" onClick={onChangePassword}>
              <span className="settings-menu-icon"><ChangePasswordIcon /></span>
              Изменить пароль
            </button>
            <button className="settings-floating-menu-item" onClick={() => alert('Настройки в разработке')}>
              <span className="settings-menu-icon"><SettingsIcon /></span>
              Настройки
            </button>
            <button className="settings-floating-menu-item logout" onClick={onLogout}>
              <span className="settings-menu-icon"><LogoutIcon /></span>
              Выйти
            </button>
          </nav>
        </div>
      )}

      {/* ПРАВАЯ ЧАСТЬ (КОНТЕНТ НАСТРОЕК) */}
      <main className="settings-main">
        <div className="settings-header">
          <button className="settings-back-btn" onClick={onBack}>← Назад</button>
          <h1>Настройки</h1>
        </div>
      </main>

      {/* ОВЕРЛЕЙ ДЛЯ ЗАКРЫТИЯ МЕНЮ */}
      {isMenuOpen && (
        <div className="settings-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}
    </div>
  );
}

export default SettingsScreen;