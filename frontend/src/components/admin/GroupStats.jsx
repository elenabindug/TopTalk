import { useState, useEffect } from 'react';
import api from '../../api/axios';
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
  const [loading, setLoading] = useState(true);
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    const fetchGroupStats = async () => {
      if (!group || !group.id) return;
      
      setLoading(true);
      try {
        // Получаем участников группы
        const chatResponse = await api.get(`/chats/${group.id}`);
        const chatData = chatResponse.data;
        
        // Получаем всех пользователей
        const usersResponse = await api.get('/users');
        const allUsers = usersResponse.data;
        
        // Получаем сообщения группы
        const messagesResponse = await api.get(`/messages/${group.id}`);
        const messages = messagesResponse.data;
        
        // Общее количество сообщений
        setMessagesCount(messages.length);
        
        // Собираем статистику по участникам
        const groupMembers = chatData.users || [];
        
        // Для каждого участника считаем количество сообщений и последнюю активность
        const membersWithStats = await Promise.all(
          groupMembers.map(async (member) => {
            // Считаем количество сообщений от этого пользователя
            const userMessages = messages.filter(msg => msg.userId === member.id);
            const messageCount = userMessages.length;
            
            // Находим последнее сообщение пользователя
            const lastMessage = userMessages.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            
            // Определяем последнюю активность
            let lastSeen = member.lastSeen || member.updatedAt;
            if (lastMessage) {
              const lastMessageDate = new Date(lastMessage.createdAt);
              const lastSeenDate = new Date(lastSeen);
              if (lastMessageDate > lastSeenDate) {
                lastSeen = lastMessage.createdAt;
              }
            }
            
            return {
              id: member.id,
              name: member.name,
              email: member.email,
              avatar: member.avatar,
              lastSeen: lastSeen,
              messageCount: messageCount,
              role: member.role
            };
          })
        );
        
        // Сортируем по количеству сообщений (у кого больше - вверху)
        membersWithStats.sort((a, b) => b.messageCount - a.messageCount);
        
        setMembers(membersWithStats);
      } catch (error) {
        console.error('Ошибка загрузки статистики группы:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupStats();
  }, [group]);

  const formatLastSeen = (dateString) => {
    if (!dateString) return 'никогда';
    
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

  const isActive = (lastSeen) => {
    if (!lastSeen) return false;
    
    const date = new Date(lastSeen);
    const now = Date.now();
    
    if (timeRange === '60minutes') {
      const sixtyMinutesAgo = now - 3600000;
      return date.getTime() > sixtyMinutesAgo;
    }
    if (timeRange === '48hours') {
      const fortyEightHoursAgo = now - 172800000;
      return date.getTime() > fortyEightHoursAgo;
    }
    return true;
  };

  const getFilteredMembers = () => {
    return members.filter(member => isActive(member.lastSeen));
  };

  const filteredMembers = getFilteredMembers();
  const activeCount = filteredMembers.length;

  if (loading) {
    return (
      <div className="group-stats-container">
        <div className="group-stats-header">
          <button className="group-stats-back-btn" onClick={onBack}>
            <BackIcon /> Назад
          </button>
          <h1>Статистика группы</h1>
        </div>
        <div className="loading-stats">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="group-stats-container">
      <div className="group-stats-header">
        <button className="group-stats-back-btn" onClick={onBack}>
          <BackIcon /> Назад
        </button>
        <h1>Статистика группы</h1>
      </div>

      <div className="group-stats-content">
        <div className="group-info-card">
          <div className="group-icon-large">
            {group.avatar ? (
              <img src={group.avatar} alt={group.name} className="group-avatar-large" />
            ) : (
              <span className="group-icon-placeholder"></span>
            )}
          </div>
          <div className="group-info-details">
            <h2>{group.name}</h2>
            <div className="group-members-count"> Всего участников: {members.length}</div>
            <div className="group-messages-count"> Всего сообщений: {messagesCount}</div>
            <div className="group-active-count"> Активны за выбранный период: {activeCount}</div>
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
                      <div className="user-avatar-small">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <span>{member.name?.[0] || ''}</span>
                        )}
                      </div>
                      <div className="user-info-cell">
                        <span className="user-name">{member.name}</span>
                        <span className="user-role">{member.role === 'admin' ? 'Админ' : member.role === 'teacher' ? 'Преподаватель' : 'Студент'}</span>
                      </div>
                    </td>
                    <td className="last-seen-cell">
                      <span className={`status-dot ${new Date(member.lastSeen).getTime() > Date.now() - 3600000 ? 'online' : 'offline'}`}></span>
                      {formatLastSeen(member.lastSeen)}
                    </td>
                    <td className="message-count-cell">
                      <span className="message-badge">{member.messageCount}</span>
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