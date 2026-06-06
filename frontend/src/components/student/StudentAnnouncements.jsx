import { useState, useEffect } from 'react';
import './StudentAnnouncements.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

function StudentAnnouncements({ onBack }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const savedPosts = localStorage.getItem('announcements');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
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

  return (
    <div className="student-announcements-container">
      <div className="student-announcements-header">
        <button className="student-announcements-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>📢 Объявления</h1>
      </div>

      <div className="student-announcements-list">
        {posts.length === 0 ? (
          <div className="student-empty-announcements">
            <div className="empty-icon">📭</div>
            <p>Пока нет объявлений</p>
            <p className="empty-subtitle">Здесь будут появляться важные уведомления</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="student-announcement-card">
              <div className="student-announcement-date">
                📅 {formatDate(post.date)}
              </div>
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