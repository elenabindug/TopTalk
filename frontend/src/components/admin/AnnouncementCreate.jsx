import { useState } from 'react';
import './AnnouncementCreate.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

function AnnouncementCreate({ onBack }) {
  const [text, setText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [sending, setSending] = useState(false);

  // Список групп (позже можно будет загружать с сервера)
  const groups = [
    { id: 'all', name: 'Все пользователи', icon: '🌍', count: 156 },
    { id: 'students', name: 'Студенты', icon: '🎓', count: 128 },
    { id: 'teachers', name: 'Преподаватели', icon: '👨‍🏫', count: 28 },
    { id: 'group1', name: 'Группа: Веб-разработка', icon: '💻', count: 24 },
    { id: 'group2', name: 'Группа: Дизайн', icon: '🎨', count: 18 },
    { id: 'group3', name: 'Группа: Мобильная разработка', icon: '📱', count: 15 }
  ];

  const handleCreate = () => {
    if (!text.trim()) {
      alert('Введите текст объявления');
      return;
    }
    
    setSending(true);
    
    // Имитация отправки
    setTimeout(() => {
      const savedPosts = localStorage.getItem('announcements');
      const posts = savedPosts ? JSON.parse(savedPosts) : [];
      
      const newPost = {
        id: Date.now(),
        text: text,
        groupId: selectedGroup,
        groupName: groups.find(g => g.id === selectedGroup)?.name || 'Все пользователи',
        date: new Date().toISOString(),
        views: 0,
        viewers: [],
        reactions: []
      };
      
      localStorage.setItem('announcements', JSON.stringify([newPost, ...posts]));
      setSending(false);
      alert(`Объявление отправлено в группу "${groups.find(g => g.id === selectedGroup)?.name}"!`);
      onBack();
    }, 1000);
  };

  return (
    <div className="announcement-create-container">
      <div className="announcement-create-header">
        <button className="create-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>✏️ Создание рассылки</h1>
      </div>

      <div className="create-form">
        <div className="create-form-card">
          {/* Выбор группы */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">👥</span>
              Выберите группу получателей
            </label>
            <div className="groups-grid">
              {groups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  className={`group-card ${selectedGroup === group.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="group-icon">{group.icon}</div>
                  <div className="group-info">
                    <div className="group-name">{group.name}</div>
                    <div className="group-count">{group.count} участников</div>
                  </div>
                  {selectedGroup === group.id && (
                    <div className="check-mark">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Текст объявления */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Текст объявления
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите текст объявления..."
              rows="6"
              autoFocus
            />
          </div>

          {/* Предпросмотр */}
          {text && (
            <div className="preview-section">
              <div className="preview-title">Предпросмотр:</div>
              <div className="preview-card">
                <div className="preview-group">
                  {groups.find(g => g.id === selectedGroup)?.icon} Отправляется в: {groups.find(g => g.id === selectedGroup)?.name}
                </div>
                <div className="preview-text">{text}</div>
                <div className="preview-date">
                  {new Date().toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="create-actions">
            <button 
              className="publish-btn" 
              onClick={handleCreate}
              disabled={sending}
            >
              {sending ? '⏳ Отправка...' : '📢 Опубликовать'}
            </button>
            <button className="cancel-btn" onClick={onBack}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementCreate;