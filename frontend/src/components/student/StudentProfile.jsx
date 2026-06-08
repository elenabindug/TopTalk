import { useState } from 'react';
import './StudentProfile.css';

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

function StudentProfile({ onBack, onChangePassword, userData, setUserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(userData.bio);
  const [avatar, setAvatar] = useState(userData.avatar);

  const handleAvatarChange = () => {
    const newAvatar = prompt('Введите URL новой аватарки:', avatar);
    if (newAvatar) setAvatar(newAvatar);
  };

  const handleSave = () => {
    setUserData({ ...userData, bio: tempBio, avatar: avatar });
    setIsEditing(false);
  };

  return (
    <div className="student-profile-container">
      <div className="student-profile-header">
        <button className="student-profile-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>Профиль студента</h1>
      </div>

      <div className="student-profile-card">
        <div className="student-profile-avatar-container">
          <div className="student-profile-avatar" style={{ backgroundImage: `url(${avatar})` }}>
            {!avatar && <span className="avatar-placeholder">{userData.name?.[0] || 'С'}</span>}
          </div>
          <button className="student-profile-avatar-edit" onClick={handleAvatarChange}>
            <EditIcon />
          </button>
        </div>

        {/* Имя — только для просмотра, не редактируется */}
        <div className="student-profile-name">{userData.name}</div>

        <div className="student-profile-bio-container">
          {isEditing ? (
            <div className="student-profile-bio-edit">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                rows={3}
                placeholder="Расскажите о себе..."
              />
              <button className="save-bio-btn" onClick={handleSave}>Сохранить</button>
            </div>
          ) : (
            <div className="student-profile-bio" onClick={() => setIsEditing(true)}>
              {userData.bio || 'Добавьте описание профиля...'}
              <EditIcon />
            </div>
          )}
        </div>

        <div className="student-profile-buttons">
          <button className="student-profile-action-btn" onClick={onChangePassword}>
            Сменить пароль
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;