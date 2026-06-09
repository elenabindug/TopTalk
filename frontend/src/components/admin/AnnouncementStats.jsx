import { useState } from 'react';
import './AnnouncementStats.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

function AnnouncementStats({ post, onBack }) {
  const [activeTab, setActiveTab] = useState('views');

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const reactionsByType = {};
  if (post.reactions && post.reactions.length > 0) {
    post.reactions.forEach(reaction => {
      if (!reactionsByType[reaction.type]) {
        reactionsByType[reaction.type] = [];
      }
      reactionsByType[reaction.type].push(reaction);
    });
  }

  return (
    <div className="stats-page">
      <div className="stats-page-header">
        <button className="stats-page-back" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>Статистика объявления</h1>
      </div>

      <div className="stats-page-content">
        <div className="stats-post">
          <div className="stats-post-date">{formatDate(post.date)}</div>
          <div className="stats-post-text">{post.text}</div>
        </div>

        <div className="stats-tabs">
          <button 
            className={`stats-tab ${activeTab === 'views' ? 'active' : ''}`}
            onClick={() => setActiveTab('views')}
          >
             Просмотры ({post.views || 0})
          </button>
          <button 
            className={`stats-tab ${activeTab === 'reactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('reactions')}
          >
             Реакции ({post.reactions?.length || 0})
          </button>
        </div>

        {activeTab === 'views' && (
          <div className="stats-views">
            {post.viewers && post.viewers.length > 0 ? (
              post.viewers.map((viewer, index) => (
                <div key={index} className="stats-viewer">
                  <div className="stats-viewer-avatar"></div>
                  <div className="stats-viewer-info">
                    <div className="stats-viewer-name">{viewer.name}</div>
                    <div className="stats-viewer-time">{formatDateTime(viewer.time)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="stats-empty">
                <span className="stats-empty-icon"></span>
                <p>Нет просмотров</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reactions' && (
          <div className="stats-reactions">
            {post.reactions && post.reactions.length > 0 ? (
              <>
                <div className="stats-reactions-summary">
                  {Object.entries(reactionsByType).map(([type, items]) => (
                    <div key={type} className="stats-reaction-badge">
                      <span>{type}</span>
                      <span>{items.length}</span>
                    </div>
                  ))}
                </div>
                <div className="stats-reactions-list">
                  {post.reactions.map((reaction, index) => (
                    <div key={index} className="stats-reaction">
                      <div className="stats-reaction-emoji">{reaction.type}</div>
                      <div className="stats-reaction-info">
                        <div className="stats-reaction-name">{reaction.name}</div>
                        <div className="stats-reaction-time">{formatDateTime(reaction.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="stats-empty">
                <span className="stats-empty-icon"></span>
                <p>Нет реакций</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementStats;