import { useState } from 'react';
import api from '../../api/axios';
import './AnnouncementCreate.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

function AnnouncementCreate({ onBack, onSuccess }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedGroups, setSelectedGroups] = useState(['all']);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const groups = [
    { id: 'all', name: 'Все пользователи', count: 156 },
    { id: 'students', name: 'Студенты', count: 128 },
    { id: 'teachers', name: 'Преподаватели', count: 28 },
    { id: 'group1', name: 'Веб-разработка', count: 24 },
    { id: 'group2', name: 'Дизайн', count: 18 },
    { id: 'group3', name: 'Мобильная разработка', count: 15 }
  ];

  const handleGroupToggle = (groupId) => {
    if (selectedGroups.includes('all') && groupId !== 'all') {
      setSelectedGroups([groupId]);
      return;
    }
    if (groupId === 'all') {
      setSelectedGroups(['all']);
      return;
    }
    if (selectedGroups.includes(groupId)) {
      const newSelected = selectedGroups.filter(id => id !== groupId);
      if (newSelected.length === 0) {
        setSelectedGroups(['all']);
      } else {
        setSelectedGroups(newSelected);
      }
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Введите заголовок объявления');
      return;
    }
    if (!text.trim()) {
      alert('Введите текст объявления');
      return;
    }
    
    setSending(true);
    setError('');
    
    try {
      const response = await api.post('/announcements', {
        title: title,
        text: text,
        groupIds: selectedGroups
      });
      
      console.log('Объявление создано:', response.data);
      alert('Объявление успешно опубликовано!');
      
      if (onSuccess) {
        onSuccess();
      }
      onBack();
    } catch (error) {
      console.error('Ошибка создания:', error);
      setError(error.response?.data?.error || 'Ошибка при создании объявления');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="announcement-create-container">
      <div className="announcement-create-header">
        <button className="create-back-btn" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>Создание рассылки</h1>
        <div className="placeholder"></div>
      </div>

      <div className="create-two-columns">
        {/* Левая колонка */}
        <div className="create-left">
          <div className="create-section">
            <div className="create-section-title">Заголовок объявления</div>
            <input 
              type="text" 
              className="create-title-input" 
              placeholder="Введите заголовок"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="create-section">
            <div className="create-section-title">Текст объявления</div>
            <textarea 
              className="create-textarea" 
              placeholder="Введите текст объявления..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
            />
          </div>
        </div>

        {/* Правая колонка */}
        <div className="create-right">
          <div className="create-section">
            <div className="create-section-title">Группы получателей</div>
            <div className="groups-list">
              {groups.map(group => (
                <button
                  key={group.id}
                  className={`group-item ${selectedGroups.includes(group.id) ? 'selected' : ''}`}
                  onClick={() => handleGroupToggle(group.id)}
                >
                  <span className="group-name">{group.name}</span>
                  <span className="group-count">{group.count} участников</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="create-error">{error}</div>
      )}

      <div className="create-buttons">
        <button 
          className="create-publish-btn" 
          onClick={handleCreate}
          disabled={sending}
        >
          {sending ? 'Публикация...' : 'Опубликовать'}
        </button>
        <button className="create-cancel-btn" onClick={onBack}>
          Отмена
        </button>
      </div>
    </div>
  );
}

export default AnnouncementCreate;