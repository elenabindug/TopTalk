import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './StudentAnnouncements.css';

const MailIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
    <polyline points="22,7 12,13 2,7"/>
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

function StudentAnnouncements({ onBack }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchAnnouncements();
  }, []);

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

  return (
    <div className="student-announcements-container">
      <div className="student-announcements-header">
        <button className="student-announcements-back-btn" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>Объявления</h1>
        <div className="placeholder"></div>
      </div>

      <div className="student-announcements-list">
        {posts.length === 0 ? (
          <div className="student-empty-announcements">
            <div className="empty-icon"><MailIcon /></div>
            <p>Пока нет объявлений</p>
            <p className="empty-subtitle">Здесь будут появляться важные уведомления</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="student-announcement-card">
              <div className="student-announcement-date">
                {formatDate(post.createdAt)}
              </div>
              {post.title && (
                <div className="student-announcement-title">{post.title}</div>
              )}
              <div className="student-announcement-text">
                {post.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentAnnouncements;