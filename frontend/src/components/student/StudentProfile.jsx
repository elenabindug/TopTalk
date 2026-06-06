import { useState } from 'react';
import './ProfileScreen.css';

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

function ProfileScreen({ onBack, onChangePassword, userData, setUserData }) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(userData.bio);
  const [avatar, setAvatar] = useState(userData.avatar);

  const handleAvatarChange = () => {
    const newAvatar = prompt('Введите URL новой аватарки:', avatar);
    if (newAvatar) {
      setAvatar(newAvatar);
      setUserData({ ...userData, avatar: newAvatar });
    }
  };

  const saveBio = () => {
    setUserData({ ...userData, bio: tempBio });
    setIsEditingBio(false);
  };

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <button className="profile-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>Профиль</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-container">
          <div className="profile-avatar" style={{ backgroundImage: `url(${avatar})` }}>
            {!avatar && <span className="avatar-placeholder">{userData.name?.[0] || 'А'}</span>}
          </div>
          <button className="profile-avatar-edit" onClick={handleAvatarChange}>
            <EditIcon />
          </button>
        </div>

        <div className="profile-name">
          {userData.name}
        </div>

        <div className="profile-bio-container">
          {isEditingBio ? (
            <div className="profile-bio-edit">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                rows={3}
                placeholder="Расскажите о себе..."
              />
              <button onClick={saveBio} className="save-bio-btn">Сохранить</button>
            </div>
          ) : (
            <div className="profile-bio" onClick={() => setIsEditingBio(true)}>
              {userData.bio || 'Добавьте описание профиля...'}
              <EditIcon />
            </div>
          )}
        </div>
      </div>

      <div className="profile-buttons">
        <button className="profile-action-btn" onClick={onChangePassword}>
          Смена пароля
        </button>
      </div>
    </div>
  );
}

export default ProfileScreen;