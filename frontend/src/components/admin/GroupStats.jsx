import { useState, useEffect } from 'react';
import './GroupStats.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

function GroupStats({ group, onBack }) {
  const [timeRange, setTimeRange] = useState('48hours');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const allUsers = JSON.parse(savedUsers);
      const groupMembers = allUsers.map(user => ({
        id: user.id,
        name: user.fullName,
        lastSeen: getRandomLastSeen(),
        messageCount: Math.floor(Math.random() * 150)
      }));
      setMembers(groupMembers);
    } else {
      const testMembers = [
        { id: 1, name: 'Анна Смирнова', lastSeen: new Date().toISOString(), messageCount: 45 },
        { id: 2, name: 'Иван Петров', lastSeen: new Date(Date.now() - 3600000).toISOString(), messageCount: 32 },
        { id: 3, name: 'Мария Сидорова', lastSeen: new Date(Date.now() - 7200000).toISOString(), messageCount: 28 },
        { id: 4, name: 'Дмитрий Иванов', lastSeen: new Date(Date.now() - 86400000).toISOString(), messageCount: 15 },
        { id: 5, name: 'Елена Козлова', lastSeen: new Date().toISOString(), messageCount: 67 },
      ];
      setMembers(testMembers);
    }
  }, []);

  const getRandomLastSeen = () => {
    const times = [
      new Date().toISOString(),
      new Date(Date.now() - 1800000).toISOString(),
      new Date(Date.now() - 3600000).toISOString(),
      new Date(Date.now() - 86400000).toISOString(),
      new Date(Date.now() - 172800000).toISOString(),
    ];
    return times[Math.floor(Math.random() * times.length)];
  };

  const formatLastSeen = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} д назад`;
  };

  const getFilteredMembers = () => {
    if (timeRange === '60minutes') {
      const sixtyMinutesAgo = Date.now() - 3600000;
      return members.filter(m => new Date(m.lastSeen).getTime() > sixtyMinutesAgo);
    }
    if (timeRange === '48hours') {
      const fortyEightHoursAgo = Date.now() - 172800000;
      return members.filter(m => new Date(m.lastSeen).getTime() > fortyEightHoursAgo);
    }
    return members;
  };

  const filteredMembers = getFilteredMembers();
  const activeCount = filteredMembers.length;

  return (
    <div className="group-stats-container">
      <div className="group-stats-header">
        <button className="group-stats-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>📊 Статистика</h1>
      </div>

      <div className="group-stats-content">
        <div className="group-info-card">
          <div className="group-icon-large">{group.icon || '👥'}</div>
          <div className="group-info-details">
            <h2>{group.name}</h2>
            <div className="group-members-count">👥 Всего участников: {members.length}</div>
            <div className="group-active-count">🟢 Активны за выбранный период: {activeCount}</div>
          </div>
        </div>

        <div className="time-range-selector">
          <button 
            className={`time-btn ${timeRange === '48hours' ? 'active' : ''}`}
            onClick={() => setTimeRange('48hours')}
          >
            За 48 часов
          </button>
          <button 
            className={`time-btn ${timeRange === '60minutes' ? 'active' : ''}`}
            onClick={() => setTimeRange('60minutes')}
          >
            За 60 минут
          </button>
        </div>

        <div className="stats-table-wrapper">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Был в сети</th>
                <th>Сообщений</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-table">
                    Нет активных участников за выбранный период
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => (
                  <tr key={member.id}>
                    <td className="user-cell">
                      <div className="user-avatar-small">👤</div>
                      <span>{member.name}</span>
                    </td>
                    <td className="last-seen-cell">
                      <span className={`status-dot ${new Date(member.lastSeen).getTime() > Date.now() - 3600000 ? 'online' : 'offline'}`}></span>
                      {formatLastSeen(member.lastSeen)}
                    </td>
                    <td className="message-count-cell">
                      {member.messageCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GroupStats;