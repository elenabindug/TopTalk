import { useState, useEffect, useRef } from 'react';
import AnnouncementStats from './AnnouncementStats';
import AnnouncementCreate from './AnnouncementCreate';
import api from '../../api/axios';
import './AdminAnnouncements.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const StatsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
    <path d="M21 12v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3"/>
    <path d="M12 2v8m0 0-3-3m3 3 3-3"/>
    <path d="M12 10v4"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const MailIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
    <polyline points="22,7 12,13 2,7"/>
  </svg>
);

function AdminAnnouncements({ onBack }) {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          menuBtnRef.current &&
          !menuBtnRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (deleteConfirm && 
          deleteModalRef.current && 
          !deleteModalRef.current.contains(event.target)) {
        setDeleteConfirm(false);
        setSelectedPostId('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, deleteConfirm]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setPosts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDeleteClick = (postId) => {
    setSelectedPostId(postId);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedPostId) return;
    
    try {
      await api.delete(`/announcements/${selectedPostId}`);
      await fetchAnnouncements();
      setDeleteConfirm(false);
      setSelectedPostId('');
      alert('Объявление удалено!');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении');
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

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (currentPage === 'stats' && selectedPost) {
    return <AnnouncementStats post={selectedPost} onBack={() => setCurrentPage('list')} />;
  }

  if (currentPage === 'create') {
    return <AnnouncementCreate onBack={() => { setCurrentPage('list'); fetchAnnouncements(); }} />;
  }

  return (
    <div className="admin-announcements-container">
      <div className="admin-announcements-header">
        <button className="admin-back-btn" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>Объявления</h1>
        <button className="admin-create-btn" onClick={() => setCurrentPage('create')}>
          <PlusIcon />
        </button>
      </div>

      {isMenuOpen && (
        <>
          <div className="admin-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div ref={menuRef} className="admin-floating-menu">
            <div className="admin-menu-header">
              <div className="admin-menu-avatar"></div>
              <div className="admin-menu-info">
                <span className="admin-menu-name">Администратор</span>
                <span className="admin-menu-role">Управление</span>
              </div>
            </div>
            <nav className="admin-menu-nav">
              <button className="admin-menu-item" onClick={() => { setCurrentPage('list'); setIsMenuOpen(false); }}>Главная</button>
              <button className="admin-menu-item" onClick={() => { setCurrentPage('create'); setIsMenuOpen(false); }}>Создать рассылку</button>
              <button className="admin-menu-item" onClick={() => { setShowDeleteModal(true); setIsMenuOpen(false); }}>Удалить рассылку</button>
            </nav>
          </div>
        </>
      )}

      {/* Модальное окно выбора объявления для удаления */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>🗑️ Удаление рассылки</h3>
              <button className="close-modal" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="delete-modal-body">
              <label>Выберите объявление для удаления:</label>
              <select value={selectedPostId} onChange={(e) => setSelectedPostId(e.target.value)}>
                <option value="">-- Выберите объявление --</option>
                {posts.map(post => (
                  <option key={post.id} value={post.id}>
                    {formatDate(post.createdAt)} - {(post.title || post.text).substring(0, 50)}...
                  </option>
                ))}
              </select>
              {selectedPostId && (
                <div className="delete-preview">
                  <h4>Предпросмотр:</h4>
                  <div className="preview-card">
                    <div className="preview-date">{formatDate(posts.find(p => p.id === parseInt(selectedPostId))?.createdAt)}</div>
                    {posts.find(p => p.id === parseInt(selectedPostId))?.title && (
                      <div className="preview-title">{posts.find(p => p.id === parseInt(selectedPostId))?.title}</div>
                    )}
                    <div className="preview-text">{posts.find(p => p.id === parseInt(selectedPostId))?.text}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="delete-modal-footer">
              <button className="confirm-delete-btn" onClick={() => {
                setShowDeleteModal(false);
                if (selectedPostId) handleDeleteClick(selectedPostId);
              }}>Удалить</button>
              <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal" ref={deleteModalRef}>
            <div className="confirm-modal-header">
              <h3>⚠️ Подтверждение удаления</h3>
            </div>
            <div className="confirm-modal-body">
              <p>Вы действительно хотите удалить это объявление?</p>
              <p className="confirm-warning">Это действие нельзя отменить.</p>
            </div>
            <div className="confirm-modal-footer">
              <button className="confirm-yes-btn" onClick={confirmDelete}>Да, удалить</button>
              <button className="confirm-no-btn" onClick={() => setDeleteConfirm(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-announcements-list">
        {posts.length === 0 ? (
          <div className="admin-empty-announcements">
            <div className="empty-icon">
              <MailIcon />
            </div>
            <p>Пока нет объявлений</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="admin-announcement-card">
              <div className="admin-announcement-header">
                <div className="admin-announcement-date">
                  {formatDate(post.createdAt)}
                </div>
                <div className="admin-announcement-actions">
                  <button className="stats-btn" onClick={() => { setSelectedPost(post); setCurrentPage('stats'); }}>
                    <StatsIcon /> Статистика
                  </button>
                </div>
              </div>
              {post.title && (
                <div className="admin-announcement-title">{post.title}</div>
              )}
              <div className="admin-announcement-text">
                {post.text}
              </div>
              <div className="admin-announcement-footer">
                <button className="delete-btn" onClick={() => handleDeleteClick(post.id)}>
                  <DeleteIcon /> Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminAnnouncements;