import { useState, useEffect, useRef } from 'react';
import AdminAnnouncements from './AdminAnnouncements';
import AdminProfile from './AdminProfile';
import GroupStats from './GroupStats';
import ChangePasswordStep1 from '../common/ChangePasswordStep1';
import ChangePasswordStep2 from '../common/ChangePasswordStep2';
import './AdminChat.css';

// Иконки SVG
const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const AddUserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="16" y1="11" x2="22" y2="11"/>
  </svg>
);

const CreateGroupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

function AdminChat({ onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupStats, setShowGroupStats] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState(null);
  
  const [userData, setUserData] = useState({
    name: 'Администратор',
    bio: 'Управление системой TopTalk',
    avatar: ''
  });
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    icon: '👥',
    members: []
  });
  const [searchMember, setSearchMember] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [newMember, setNewMember] = useState({
    fullName: '',
    birthDate: '',
    group: '',
    email: '',
    role: 'student'
  });

  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  const addEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Обработчики смены пароля
  const handleChangePasswordStart = () => {
    setChangePasswordStep('step1');
  };

  const handleEmailSent = () => {
    setChangePasswordStep('step2');
  };

  const handleChangePasswordComplete = () => {
    setChangePasswordStep(null);
    alert('Пароль успешно изменён!');
  };

  const handleBackFromChangePassword = () => {
    setChangePasswordStep(null);
  };

  useEffect(() => {
    const savedGroups = localStorage.getItem('groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, []);

  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setAvailableUsers(users);
      setFilteredUsers(users);
    } else {
      const testUsers = [
        { id: 1, fullName: 'Анна Смирнова', email: 'anna@example.com', group: 'Веб-разработка' },
        { id: 2, fullName: 'Иван Петров', email: 'ivan@example.com', group: 'Дизайн' },
        { id: 3, fullName: 'Мария Сидорова', email: 'maria@example.com', group: 'Мобильная разработка' },
        { id: 4, fullName: 'Дмитрий Иванов', email: 'dmitry@example.com', group: 'Аналитика данных' }
      ];
      localStorage.setItem('users', JSON.stringify(testUsers));
      setAvailableUsers(testUsers);
      setFilteredUsers(testUsers);
    }
  }, []);

  useEffect(() => {
    if (searchMember.trim()) {
      const filtered = availableUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchMember.toLowerCase()) ||
        user.email.toLowerCase().includes(searchMember.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchMember, availableUsers]);

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
    const savedMessages = localStorage.getItem('adminMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const testMessages = [
        {
          id: 1,
          text: 'Добро пожаловать в чат админов!',
          senderId: 1,
          senderName: 'Администратор',
          chatId: 1,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString()
        },
        {
          id: 2,
          text: 'Привет! Как дела?',
          senderId: 2,
          senderName: 'Пользователь',
          chatId: 2,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString()
        }
      ];
      setMessages(testMessages);
      localStorage.setItem('adminMessages', JSON.stringify(testMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('adminMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessages = () => {
    const trimmedText = inputText.trim();
    if (trimmedText === "") return;
    if (!activeChatId) {
      alert('Выберите чат');
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: trimmedText,
      senderId: 1,
      senderName: 'Администратор',
      chatId: activeChatId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
    setIsMenuOpen(false);
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
    setIsMenuOpen(false);
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setShowGroupStats(true);
  };

  const handleSubmitGroup = () => {
    if (!newGroup.name.trim()) {
      alert('Введите название группы');
      return;
    }

    if (newGroup.members.length === 0) {
      alert('Добавьте хотя бы одного участника');
      return;
    }

    const savedGroups = localStorage.getItem('groups');
    const groupsList = savedGroups ? JSON.parse(savedGroups) : [];
    
    const newGroupData = {
      id: Date.now(),
      ...newGroup,
      createdAt: new Date().toISOString(),
      createdBy: 'Администратор'
    };
    
    groupsList.push(newGroupData);
    localStorage.setItem('groups', JSON.stringify(groupsList));
    setGroups(groupsList);
    
    alert(`Группа "${newGroup.name}" успешно создана с ${newGroup.members.length} участниками!`);
    setShowCreateGroupModal(false);
    setNewGroup({
      name: '',
      icon: '👥',
      members: []
    });
    setSearchMember('');
  };

  const addMemberToGroup = (user) => {
    if (!newGroup.members.find(m => m.id === user.id)) {
      setNewGroup({
        ...newGroup,
        members: [...newGroup.members, user]
      });
    }
  };

  const removeMemberFromGroup = (userId) => {
    setNewGroup({
      ...newGroup,
      members: newGroup.members.filter(m => m.id !== userId)
    });
  };

  const handleSubmitMember = () => {
    if (!newMember.fullName.trim()) {
      alert('Введите ФИО');
      return;
    }
    if (!newMember.birthDate) {
      alert('Введите дату рождения');
      return;
    }
    if (!newMember.group) {
      alert('Введите группу');
      return;
    }
    if (!newMember.email.trim()) {
      alert('Введите email');
      return;
    }
    if (!newMember.email.includes('@')) {
      alert('Введите корректный email');
      return;
    }

    const savedUsers = localStorage.getItem('users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    
    const newUser = {
      id: Date.now(),
      ...newMember,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert(`Участник ${newMember.fullName} успешно добавлен!`);
    setShowAddMemberModal(false);
    setNewMember({
      fullName: '',
      birthDate: '',
      group: '',
      email: '',
      role: 'student'
    });
  };

  const iconOptions = ['👥', '💻', '🎨', '📱', '📊', '🎓', '🏆', '⭐', '🔥', '💡'];

  // ========== РАННИЕ RETURN ==========
  if (changePasswordStep === 'step1') {
    return <ChangePasswordStep1 
      onBack={handleBackFromChangePassword}
      onLogout={onLogout}
      onEmailSent={handleEmailSent}
    />;
  }

  if (changePasswordStep === 'step2') {
    return <ChangePasswordStep2 
      onBack={() => setChangePasswordStep('step1')}
      onComplete={handleChangePasswordComplete}
    />;
  }

  if (showAnnouncements) {
    return <AdminAnnouncements onBack={() => setShowAnnouncements(false)} />;
  }

  if (showProfile) {
    return <AdminProfile 
      onBack={() => setShowProfile(false)}
      onChangePassword={() => {
        setShowProfile(false);
        handleChangePasswordStart();
      }}
      userData={userData}
      setUserData={setUserData}
    />;
  }

  if (showGroupStats && selectedGroup) {
    return <GroupStats group={selectedGroup} onBack={() => setShowGroupStats(false)} />;
  }

  const filteredMessages = messages.filter(msg => msg.chatId === activeChatId);

  return (
    <div className="admin-chat-container">
      <div className="admin-chat-sidebar">
        <div className="sidebar-header">
          <button 
            ref={menuBtnRef}
            className="menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <BurgerIcon />
          </button>
          <h3 style={{ color: 'white', margin: 0 }}>TopTalk</h3>
        </div>
        
        <div className="chats-list">
          <div className="chat-category">Чаты</div>
          <div 
            className={`chat-item ${activeChatId === 1 ? 'active' : ''}`}
            onClick={() => setActiveChatId(1)}
          >
            <div className="chat-avatar">👑</div>
            <div className="chat-info">
              <span className="chat-name">Чат админов</span>
            </div>
          </div>
          <div 
            className={`chat-item ${activeChatId === 2 ? 'active' : ''}`}
            onClick={() => setActiveChatId(2)}
          >
            <div className="chat-avatar">👥</div>
            <div className="chat-info">
              <span className="chat-name">Общий чат</span>
            </div>
          </div>

          {groups.length > 0 && (
            <>
              <div className="chat-category">Группы</div>
              {groups.map(group => (
                <div 
                  key={group.id}
                  className="chat-item"
                  onClick={() => handleGroupClick(group)}
                >
                  <div className="chat-avatar">{group.icon}</div>
                  <div className="chat-info">
                    <span className="chat-name">{group.name}</span>
                    <span className="chat-members">{group.members.length} участников</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div className="admin-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div ref={menuRef} className="floating-menu">
            <div className="floating-menu-header">
              <div className="user-avatar">👑</div>
              <div className="user-info">
                <span className="user-nickname">Администратор</span>
                <span className="admin-badge">Admin</span>
              </div>
            </div>
            <nav className="floating-menu-nav">
              <button className="floating-menu-item" onClick={() => setShowProfile(true)}>
                <span className="menu-icon">👤</span>
                Мой профиль
              </button>
              <button className="floating-menu-item" onClick={() => setShowAnnouncements(true)}>
                <span className="menu-icon">📢</span>
                Объявления
              </button>
              <button className="floating-menu-item" onClick={handleAddMember}>
                <span className="menu-icon">➕</span>
                Добавить участника
              </button>
              <button className="floating-menu-item" onClick={handleCreateGroup}>
                <span className="menu-icon">👥</span>
                Создать группу
              </button>
              <button className="floating-menu-item logout" onClick={onLogout}>
                <span className="menu-icon">🚪</span>
                Выйти
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Модальное окно добавления участника */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddMemberModal(false);
        }}>
          <div className="add-member-modal">
            <div className="modal-header">
              <h2>➕ Новый участник</h2>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>ФИО</label>
                <input 
                  type="text" 
                  placeholder="Иванов Иван Иванович"
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Дата рождения</label>
                <input 
                  type="date" 
                  value={newMember.birthDate}
                  onChange={(e) => setNewMember({...newMember, birthDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Группа</label>
                <select 
                  value={newMember.group}
                  onChange={(e) => setNewMember({...newMember, group: e.target.value})}
                >
                  <option value="">Выберите группу</option>
                  <option value="Веб-разработка">Веб-разработка</option>
                  <option value="Дизайн">Дизайн</option>
                  <option value="Мобильная разработка">Мобильная разработка</option>
                  <option value="Аналитика данных">Аналитика данных</option>
                </select>
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input 
                  type="email" 
                  placeholder="ivanov@example.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Роль</label>
                <select 
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                >
                  <option value="student">Студент</option>
                  <option value="teacher">Преподаватель</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddMemberModal(false)}>
                Отмена
              </button>
              <button className="submit-btn" onClick={handleSubmitMember}>
                Добавить участника
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания группы */}
      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowCreateGroupModal(false);
        }}>
          <div className="create-group-modal">
            <div className="modal-header">
              <h2>➕ Новая группа</h2>
              <button className="modal-close" onClick={() => setShowCreateGroupModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="group-icon-section">
                <div className="group-icon-preview">
                  <span className="group-icon-large">{newGroup.icon}</span>
                  <span className="group-icon-label">Иконка группы</span>
                </div>
                <div className="group-icon-options">
                  {iconOptions.map(icon => (
                    <button 
                      key={icon}
                      className={`icon-option ${newGroup.icon === icon ? 'active' : ''}`}
                      onClick={() => setNewGroup({...newGroup, icon: icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Название группы</label>
                <input 
                  type="text" 
                  placeholder="Введите название группы"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Поиск участников</label>
                <div className="search-member-container">
                  <input 
                    type="text" 
                    placeholder="🔍 Поиск по имени или email..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                  />
                  <button className="add-member-btn">➕</button>
                </div>
              </div>

              {searchMember && filteredUsers.length > 0 && (
                <div className="search-results">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="search-result-item" onClick={() => addMemberToGroup(user)}>
                      <div className="result-avatar">👤</div>
                      <div className="result-info">
                        <div className="result-name">{user.fullName}</div>
                        <div className="result-email">{user.email}</div>
                      </div>
                      <button className="result-add">+</button>
                    </div>
                  ))}
                </div>
              )}

              {newGroup.members.length > 0 && (
                <div className="group-members-list">
                  <label>Участники группы ({newGroup.members.length})</label>
                  <div className="members-container">
                    {newGroup.members.map(member => (
                      <div key={member.id} className="member-tag">
                        <span>👤 {member.fullName}</span>
                        <button onClick={() => removeMemberFromGroup(member.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateGroupModal(false)}>
                Отмена
              </button>
              <button className="submit-btn" onClick={handleSubmitGroup}>
                Создать группу
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="admin-chat-main">
        {!activeChatId ? (
          <div className="chat-placeholder">
            Выберите чат
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h2 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => handleGroupClick({ 
                  id: activeChatId === 1 ? 1 : 2, 
                  name: activeChatId === 1 ? 'Чат админов' : 'Общий чат', 
                  icon: activeChatId === 1 ? '👑' : '👥', 
                  members: [] 
                })}
              >
                {activeChatId === 1 ? 'Чат админов' : 'Общий чат'}
                <span style={{ fontSize: '12px', color: '#5A29B4' }}>📊 стат</span>
              </h2>
            </div>
            <div className="chat-messages">
              {filteredMessages.length === 0 ? (
                <div className="no-messages">
                  Нет сообщений. Напишите первое сообщение!
                </div>
              ) : (
                filteredMessages.map(msg => (
                  <div key={msg.id} className={`message ${msg.senderId === 1 ? 'message-mine' : 'message-other'}`}>
                    <div className="message-bubble">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{msg.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input-container">
              <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                😊
              </button>
              <label className="file-btn">
                📎
                <input type="file" hidden />
              </label>
              <input
                type="text"
                className="chat-input"
                placeholder="Введите сообщение..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessages()}
              />
              <button className="send-btn" onClick={sendMessages}>
                Отправить
              </button>
            </div>
            {showEmojiPicker && (
              <div className="emoji-picker">
                <button onClick={() => addEmoji('😊')}>😊</button>
                <button onClick={() => addEmoji('😂')}>😂</button>
                <button onClick={() => addEmoji('❤️')}>❤️</button>
                <button onClick={() => addEmoji('👍')}>👍</button>
                <button onClick={() => addEmoji('🔥')}>🔥</button>
                <button onClick={() => addEmoji('🎉')}>🎉</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminChat;