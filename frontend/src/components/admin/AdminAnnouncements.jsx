import { useState, useEffect, useRef } from 'react';
import AnnouncementStats from './AnnouncementStats';
import AnnouncementCreate from './AnnouncementCreate';
import './AdminAnnouncements.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const StatsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3"/>
    <path d="M12 2v8m0 0-3-3m3 3 3-3"/>
    <path d="M12 10v4"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const CreateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);

function AdminAnnouncements({ onBack }) {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');
  
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          menuBtnRef.current &&
          !menuBtnRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const savedPosts = localStorage.getItem('announcements');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const testPosts = [
        {
          id: 1,
          text: 'Добро пожаловать в TopTalk!',
          groupId: 'all',
          groupName: 'Все пользователи',
          date: new Date().toISOString(),
          views: 45,
          viewers: [
            { name: 'Анна Смирнова', time: new Date().toISOString() },
            { name: 'Иван Петров', time: new Date().toISOString() }
          ],
          reactions: [
            { name: 'Мария Сидорова', type: '👍', time: new Date().toISOString() }
          ]
        },
        {
          id: 2,
          text: 'Обновление приложения выйдет завтра в 20:00',
          groupId: 'students',
          groupName: 'Студенты',
          date: new Date(Date.now() - 86400000).toISOString(),
          views: 128,
          viewers: [
            { name: 'Анна Смирнова', time: new Date().toISOString() },
            { name: 'Иван Петров', time: new Date().toISOString() },
            { name: 'Мария Сидорова', time: new Date().toISOString() },
            { name: 'Дмитрий Иванов', time: new Date().toISOString() }
          ],
          reactions: [
            { name: 'Анна Смирнова', type: '❤️', time: new Date().toISOString() },
            { name: 'Иван Петров', type: '👍', time: new Date().toISOString() }
          ]
        }
      ];
      localStorage.setItem('announcements', JSON.stringify(testPosts));
      setPosts(testPosts);
    }
  }, []);

  const handleDelete = () => {
    if (!selectedPostId) {
      alert('Выберите объявление для удаления');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      const filtered = posts.filter(post => post.id !== parseInt(selectedPostId));
      localStorage.setItem('announcements', JSON.stringify(filtered));
      setPosts(filtered);
      setShowDeleteModal(false);
      setSelectedPostId('');
      alert('Объявление удалено!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Навигация по страницам
  if (currentPage === 'stats' && selectedPost) {
    return <AnnouncementStats post={selectedPost} onBack={() => setCurrentPage('list')} />;
  }

  if (currentPage === 'create') {
    return <AnnouncementCreate onBack={() => setCurrentPage('list')} />;
  }

  // Главная страница со списком
  return (
    <div className="admin-announcements-container">
      <div className="admin-announcements-header">
        <button className="admin-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>👑 Управление объявлениями</h1>
        <button 
          ref={menuBtnRef}
          className="menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <BurgerIcon />
        </button>
      </div>

      {isMenuOpen && (
        <>
          <div className="admin-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div ref={menuRef} className="admin-floating-menu">
            <div className="admin-menu-header">
              <div className="admin-menu-avatar">👑</div>
              <div className="admin-menu-info">
                <span className="admin-menu-name">Администратор</span>
                <span className="admin-menu-role">Управление</span>
              </div>
            </div>
            <nav className="admin-menu-nav">
              <button className="admin-menu-item" onClick={() => { setCurrentPage('list'); setIsMenuOpen(false); }}>
                Главная
              </button>
              <button className="admin-menu-item" onClick={() => { setCurrentPage('create'); setIsMenuOpen(false); }}>
                <CreateIcon /> Создать рассылку
              </button>
              <button className="admin-menu-item" onClick={() => { setShowDeleteModal(true); setIsMenuOpen(false); }}>
                <DeleteIcon /> Удалить рассылку
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowDeleteModal(false);
        }}>
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>🗑️ Удаление рассылки</h3>
              <button className="close-modal" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="delete-modal-body">
              <label>Выберите объявление для удаления:</label>
              <select 
                value={selectedPostId} 
                onChange={(e) => setSelectedPostId(e.target.value)}
              >
                <option value="">-- Выберите объявление --</option>
                {posts.map(post => (
                  <option key={post.id} value={post.id}>
                    {formatDate(post.date)} - {post.text.substring(0, 50)}...
                  </option>
                ))}
              </select>
              
              {selectedPostId && (
                <div className="delete-preview">
                  <h4>Предпросмотр:</h4>
                  <div className="preview-card">
                    <div className="preview-date">
                      {formatDate(posts.find(p => p.id === parseInt(selectedPostId))?.date)}
                    </div>
                    <div className="preview-text">
                      {posts.find(p => p.id === parseInt(selectedPostId))?.text}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="delete-modal-footer">
              <button className="confirm-delete-btn" onClick={handleDelete}>
                Удалить
              </button>
              <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список объявлений */}
      <div className="admin-announcements-list">
        {posts.length === 0 ? (
          <div className="admin-empty-announcements">
            <div className="empty-icon">📭</div>
            <p>Нет объявлений</p>
            <button className="create-first-btn" onClick={() => setCurrentPage('create')}>
              Создать первое объявление
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="admin-announcement-card">
              <div className="admin-announcement-header">
                <div className="admin-announcement-date">
                  📅 {formatDate(post.date)}
                  {post.groupName && (
                    <span className="announcement-group">
                      👥 {post.groupName}
                    </span>
                  )}
                </div>
                <div className="admin-announcement-actions">
                  <button 
                    className="stats-btn" 
                    onClick={() => {
                      setSelectedPost(post);
                      setCurrentPage('stats');
                    }}
                  >
                    <StatsIcon /> Статистика
                  </button>
                </div>
              </div>
              <div className="admin-announcement-text">
                {post.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminAnnouncements;