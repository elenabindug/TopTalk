import { useState } from 'react';
import './AdminProfile.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
    <path d="M4 20h16"/>
  </svg>
);

function AdminProfile({ onBack, onChangePassword, userData, setUserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userData.name);
  const [tempBio, setTempBio] = useState(userData.bio);
  const [avatar, setAvatar] = useState(userData.avatar);

  const handleAvatarChange = () => {
    const newAvatar = prompt('Введите URL новой аватарки:', avatar);
    if (newAvatar) setAvatar(newAvatar);
  };

  const handleSave = () => {
    setUserData({ ...userData, name: tempName, bio: tempBio, avatar: avatar });
    setIsEditing(false);
  };

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-header">
        <button className="admin-profile-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>Профиль администратора</h1>
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-avatar-container">
          <div className="admin-profile-avatar" style={{ backgroundImage: `url(${avatar})` }}>
            {!avatar && <span className="avatar-placeholder">{userData.name?.[0] || 'А'}</span>}
          </div>
          <button className="admin-profile-avatar-edit" onClick={handleAvatarChange}>
            <EditIcon />
          </button>
        </div>

        {isEditing ? (
          <>
            <div className="admin-profile-field">
              <label>Имя</label>
              <input 
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)}
              />
            </div>
            <div className="admin-profile-field">
              <label>О себе</label>
              <textarea 
                value={tempBio} 
                onChange={(e) => setTempBio(e.target.value)} 
                rows="3"
                placeholder="Расскажите о себе..."
              />
            </div>
            <button className="admin-profile-save-btn" onClick={handleSave}>
              Сохранить изменения
            </button>
          </>
        ) : (
          <>
            <div className="admin-profile-name">{userData.name}</div>
            <div className="admin-profile-bio">{userData.bio || 'Администратор системы'}</div>
            <button className="admin-profile-edit-btn" onClick={() => setIsEditing(true)}>
              ✏️ Редактировать профиль
            </button>
          </>
        )}

        <div className="admin-profile-buttons">
          <button className="admin-profile-action-btn" onClick={onChangePassword}>
            Сменить пароль
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;