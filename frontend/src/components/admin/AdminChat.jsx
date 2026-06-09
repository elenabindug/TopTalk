import { useState, useEffect, useRef } from 'react';
import AdminAnnouncements from './AdminAnnouncements';
import GroupStats from './GroupStats';
import ChangePasswordStep1 from '../common/ChangePasswordStep1';
import ChangePasswordStep2 from '../common/ChangePasswordStep2';
import api from '../../api/axios';
import useSocket from '../../hooks/useSocket';
import './AdminChat.css';

// Иконки SVG
const BurgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
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

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const AnnouncementIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const SmileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const AttachIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
    <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
    <path d="M4 20h16"/>
  </svg>
);

const StatsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"/>
    <path d="M7 10l3-3 3 3 4-4"/>
    <path d="M17 10V4h-6"/>
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
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const socket = useSocket(token);
  
  const [userData, setUserData] = useState({
    name: user.name || 'Администратор',
    bio: user.bio || 'Управление системой TopTalk',
    avatar: user.avatar || ''
  });
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    avatar: '',
    members: []
  });
  const [searchMember, setSearchMember] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersInfo, setUsersInfo] = useState({});

  const [newMember, setNewMember] = useState({
    fullName: '',
    birthDate: '',
    group: '',
    email: '',
    role: 'student'
  });

  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.get('/chats');
        setChats(response.data);
      } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${activeChatId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
      }
    };
    fetchMessages();
  }, [activeChatId]);

  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!activeChatId) return;
      try {
        const response = await api.get(`/chats/${activeChatId}`);
        setChats(prev => prev.map(c => c.id === activeChatId ? response.data : c));
        
        if (response.data.users && Array.isArray(response.data.users)) {
          const newUsersInfo = { ...usersInfo };
          response.data.users.forEach(u => {
            newUsersInfo[u.id] = u;
          });
          setUsersInfo(newUsersInfo);
        }
      } catch (error) {
        console.error('Ошибка загрузки деталей чата:', error);
      }
    };
    fetchChatDetails();
  }, [activeChatId]);

  useEffect(() => {
    if (!socket || !activeChatId) return;
    
    socket.emit('join-chat', activeChatId);
    
    const handleNewMessage = (message) => {
      if (message.chatId === activeChatId) {
        setMessages(prev => [...prev, message]);
      }
    };
    
    socket.on('new-message', handleNewMessage);
    
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, activeChatId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setAvailableUsers(response.data);
        setFilteredUsers(response.data);
        
        const usersDict = {};
        response.data.forEach(u => {
          usersDict[u.id] = u;
        });
        setUsersInfo(prev => ({ ...prev, ...usersDict }));
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    };
    fetchUsers();
  }, []);

  const sendMessages = async () => {
    const trimmedText = inputText.trim();
    if (trimmedText === "") return;
    if (!activeChatId) {
      alert('Выберите чат');
      return;
    }

    try {
      const response = await api.post('/messages', {
        chatId: activeChatId,
        text: trimmedText
      });
      setMessages(prev => [...prev, response.data]);
      setInputText('');
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Не удалось отправить сообщение');
    }
  };

  const addEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleChangePasswordStart = () => setChangePasswordStep('step1');
  const handleEmailSent = () => setChangePasswordStep('step2');
  const handleChangePasswordComplete = () => {
    setChangePasswordStep(null);
    alert('Пароль успешно изменён!');
  };
  const handleBackFromChangePassword = () => setChangePasswordStep(null);

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
    if (searchMember.trim()) {
      const filtered = availableUsers.filter(user => 
        user.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchMember.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchMember, availableUsers]);

  const handleAddMember = () => setShowAddMemberModal(true);
  const handleCreateGroup = () => setShowCreateGroupModal(true);

  const handleOpenGroupStats = (group) => {
    setSelectedGroup(group);
    setShowGroupStats(true);
  };

  const handleSubmitGroup = async () => {
    if (!newGroup.name.trim()) {
      alert('Введите название группы');
      return;
    }

    if (newGroup.members.length === 0) {
      alert('Добавьте хотя бы одного участника');
      return;
    }

    try {
      const response = await api.post('/chats', {
        name: newGroup.name,
        isGroup: true,
        userIds: newGroup.members.map(m => m.id),
        avatar: newGroup.avatar
      });
      setGroups([...groups, response.data]);
      alert(`Группа "${newGroup.name}" успешно создана!`);
      setShowCreateGroupModal(false);
      setNewGroup({ name: '', avatar: '', members: [] });
      setSearchMember('');
      
      const chatsResponse = await api.get('/chats');
      setChats(chatsResponse.data);
    } catch (error) {
      console.error('Ошибка создания группы:', error);
      alert('Ошибка создания группы');
    }
  };

  const addMemberToGroup = (user) => {
    if (!newGroup.members.find(m => m.id === user.id)) {
      setNewGroup({ ...newGroup, members: [...newGroup.members, user] });
    }
  };

  const removeMemberFromGroup = (userId) => {
    setNewGroup({ ...newGroup, members: newGroup.members.filter(m => m.id !== userId) });
  };

  const handleSubmitMember = async () => {
    if (!newMember.fullName.trim()) {
      alert('Введите ФИО');
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

    const tempPassword = Math.random().toString(36).slice(-8);
    const validRoles = ['student', 'teacher', 'admin'];
    const userRole = validRoles.includes(newMember.role) ? newMember.role : 'student';

    try {
      await api.post('/auth/register', {
        name: newMember.fullName.trim(),
        email: newMember.email.trim().toLowerCase(),
        password: tempPassword,
        role: userRole
      });
      
      alert(`✅ Участник ${newMember.fullName} успешно добавлен!\n\nВременный пароль: ${tempPassword}`);
      
      setShowAddMemberModal(false);
      setNewMember({ fullName: '', birthDate: '', group: '', email: '', role: 'student' });
      
      const usersResponse = await api.get('/users');
      setAvailableUsers(usersResponse.data);
      setFilteredUsers(usersResponse.data);
      
      const usersDict = {};
      usersResponse.data.forEach(u => {
        usersDict[u.id] = u;
      });
      setUsersInfo(prev => ({ ...prev, ...usersDict }));
      
    } catch (error) {
      console.error('Ошибка добавления участника:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message;
        
        if (error.response.status === 400) {
          if (errorMessage?.includes('существует')) {
            alert('❌ Пользователь с таким email уже существует!');
          } else {
            alert(`❌ Ошибка: ${errorMessage || 'Некорректные данные'}`);
          }
        } else if (error.response.status === 401) {
          alert('❌ Сессия истекла. Пожалуйста, войдите заново.');
          onLogout();
        } else {
          alert(`❌ Ошибка сервера: ${errorMessage || 'Попробуйте позже'}`);
        }
      } else if (error.request) {
        alert('❌ Нет соединения с сервером. Проверьте интернет-соединение.');
      } else {
        alert(`❌ Ошибка: ${error.message}`);
      }
    }
  };

  const openPrivateChat = async (targetUserId) => {
    if (!targetUserId || targetUserId === user.id) {
      alert('Нельзя начать чат с самим собой');
      return;
    }
    
    console.log('Открываем личный чат с пользователем:', targetUserId);
    
    try {
      const response = await api.post('/chats', {
        userIds: [targetUserId],
        isGroup: false,
        name: null
      });
      
      console.log('Результат:', response.data);
      
      if (response.data && response.data.id) {
        const chatsResponse = await api.get('/chats');
        setChats(chatsResponse.data);
        setActiveChatId(response.data.id);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось открыть чат');
    }
  };

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

  if (showGroupStats && selectedGroup) {
    return <GroupStats group={selectedGroup} onBack={() => setShowGroupStats(false)} />;
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  const filteredMessages = messages.filter(msg => msg.chatId === activeChatId);
  const currentChat = chats.find(c => c.id === activeChatId);
  const isGroupChat = currentChat?.isGroup || false;

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
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="chats-list">
          <div className="chat-category">Чаты</div>
          {chats.filter(c => !c.isGroup).map(chat => {
            const otherUserId = chat.userIds?.find(id => id !== user.id);
            const otherUser = usersInfo[otherUserId];
            const chatName = chat.name || otherUser?.name || 'Чат';
            return (
              <div 
                key={chat.id}
                className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="chat-avatar"></div>
                <div className="chat-info">
                  <span className="chat-name">{chatName}</span>
                </div>
              </div>
            );
          })}

          {chats.filter(c => c.isGroup).length > 0 && (
            <>
              <div className="chat-category">Группы</div>
              {chats.filter(c => c.isGroup).map(group => (
                <div 
                  key={group.id}
                  className={`chat-item ${activeChatId === group.id ? 'active' : ''}`}
                  onClick={() => setActiveChatId(group.id)}
                >
                  <div className="chat-avatar"></div>
                  <div className="chat-info">
                    <span className="chat-name">{group.name}</span>
                    <span className="chat-members">{group.userIds?.length || 0} участников</span>
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
          <div ref={menuRef} className="admin-floating-menu">
            <div className="floating-menu-header">
              <div className="user-avatar"></div>
              <div className="user-info">
                <span className="user-nickname">{user.name || 'Администратор'}</span>
                <span className="admin-badge">Admin</span>
              </div>
            </div>
            <nav className="floating-menu-nav">
              <button className="floating-menu-item" onClick={() => setShowProfile(true)}>
                <span className="menu-icon"><ProfileIcon /></span> Мой профиль
              </button>
              <button className="floating-menu-item" onClick={() => setShowAnnouncements(true)}>
                <span className="menu-icon"><AnnouncementIcon /></span> Объявления
              </button>
              <button className="floating-menu-item" onClick={handleAddMember}>
                <span className="menu-icon"><AddUserIcon /></span> Добавить участника
              </button>
              <button className="floating-menu-item" onClick={handleCreateGroup}>
                <span className="menu-icon"><CreateGroupIcon /></span> Создать группу
              </button>
              <button className="floating-menu-item logout" onClick={onLogout}>
                <span className="menu-icon"><LogoutIcon /></span> Выйти
              </button>
            </nav>
          </div>
        </>
      )}

      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Новый участник</h2>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>ФИО *</label>
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
                <select value={newMember.group} onChange={(e) => setNewMember({...newMember, group: e.target.value})}>
                  <option value="">Выберите группу</option>
                  <option value="Веб-разработка">Веб-разработка</option>
                  <option value="Дизайн">Дизайн</option>
                  <option value="Мобильная разработка">Мобильная разработка</option>
                </select>
              </div>
              <div className="form-group">
                <label>E-mail *</label>
                <input 
                  type="email" 
                  placeholder="example@mail.com"
                  value={newMember.email} 
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Роль</label>
                <select value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})}>
                  <option value="student">Студент</option>
                  <option value="teacher">Преподаватель</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddMemberModal(false)}>Отмена</button>
              <button className="submit-btn" onClick={handleSubmitMember}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="create-group-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Создание новой группы</h2>
              <button className="modal-close" onClick={() => setShowCreateGroupModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="group-avatar-section">
                <div className="group-avatar-wrapper">
                  <div className="group-avatar-preview">
                    {newGroup.avatar ? (
                      <img src={newGroup.avatar} alt="Group avatar" className="group-avatar-img" />
                    ) : (
                      <span className="group-avatar-placeholder">👥</span>
                    )}
                  </div>
                  <button 
                    className="group-avatar-edit-btn"
                    onClick={() => {
                      const newAvatar = prompt('Введите URL аватарки группы:', newGroup.avatar);
                      if (newAvatar !== null) setNewGroup({...newGroup, avatar: newAvatar});
                    }}
                  >
                    <EditIcon />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Название группы</label>
                <input 
                  type="text" 
                  placeholder="Например: Веб-разработка 2024"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="group-name-input"
                />
              </div>
              <div className="form-group">
                <label>Добавить участников</label>
                <div className="search-member-wrapper">
                  <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    type="text" 
                    className="search-member-input"
                    placeholder="Поиск по имени или email..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                  />
                </div>
              </div>
              <div className="users-list-section">
                <div className="users-list-header">
                  <span>Все пользователи</span>
                  <span className="users-count">{filteredUsers.length} чел.</span>
                </div>
                <div className="users-list">
                  {filteredUsers.length === 0 ? (
                    <div className="no-users-found">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p>Пользователи не найдены</p>
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id} 
                        className={`user-list-item ${newGroup.members.find(m => m.id === user.id) ? 'added' : ''}`}
                        onClick={() => addMemberToGroup(user)}
                      >
                        <div className="user-list-avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                          ) : (
                            <span>{user.name?.[0] || '👤'}</span>
                          )}
                        </div>
                        <div className="user-list-info">
                          <div className="user-list-name">{user.name}</div>
                          <div className="user-list-email">{user.email}</div>
                        </div>
                        <button className="user-list-add-btn">
                          {newGroup.members.find(m => m.id === user.id) ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A29B4" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {newGroup.members.length > 0 && (
                <div className="selected-members-section">
                  <div className="selected-members-header">
                    <span>Выбранные участники</span>
                    <span className="selected-count">{newGroup.members.length}</span>
                  </div>
                  <div className="selected-members-list">
                    {newGroup.members.map(member => (
                      <div key={member.id} className="selected-member-tag">
                        <div className="selected-member-avatar">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} />
                          ) : (
                            <span>{member.name?.[0]}</span>
                          )}
                        </div>
                        <span className="selected-member-name">{member.name}</span>
                        <button 
                          className="remove-member-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMemberFromGroup(member.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateGroupModal(false)}>Отмена</button>
              <button className="submit-btn" onClick={handleSubmitGroup}>Создать группу</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Профиль администратора</h2>
              <button className="profile-modal-close" onClick={() => setShowProfile(false)}>✕</button>
            </div>
            <div className="profile-modal-body">
              <div className="profile-avatar-container">
                <div className="profile-avatar">
                  {!userData.avatar && <span className="avatar-placeholder">{userData.name?.[0] || 'А'}</span>}
                </div>
                {isEditing && (
                  <button className="profile-avatar-edit" onClick={() => {
                    const newAvatar = prompt('Введите URL новой аватарки:', userData.avatar);
                    if (newAvatar !== null) setUserData({...userData, avatar: newAvatar});
                  }}>
                    <EditIcon />
                  </button>
                )}
              </div>
              <div className="profile-name">{userData.name}</div>
              {isEditing ? (
                <>
                  <textarea className="profile-bio-edit-input" value={tempBio} onChange={(e) => setTempBio(e.target.value)} rows={3} placeholder="Расскажите о себе..." />
                  <button className="profile-save-btn" onClick={() => { setUserData({...userData, bio: tempBio}); setIsEditing(false); }}>Сохранить</button>
                </>
              ) : (
                <>
                  <div className="profile-bio-text">{userData.bio || 'Администратор системы'}</div>
                  <button className="profile-edit-btn" onClick={() => { setTempBio(userData.bio); setIsEditing(true); }}>Редактировать профиль</button>
                </>
              )}
              {isEditing && (
                <button className="profile-change-password-btn" onClick={() => { setShowProfile(false); handleChangePasswordStart(); }}>Сменить пароль</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="admin-chat-main">
        {!activeChatId ? (
          <div className="chat-placeholder">
            <div className="placeholder-card">Выберите, кому хотели бы написать</div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-top">
                <h2>{currentChat?.name || 'Чат'}</h2>
                {isGroupChat && (
                  <button 
                    className="stats-btn"
                    onClick={() => handleOpenGroupStats(currentChat)}
                    title="Статистика группы"
                  >
                    <StatsIcon />
                    <span>Статистика</span>
                  </button>
                )}
              </div>
              <div className="chat-header-status">
                {currentChat?.userIds?.length || currentChat?.users?.length || 0} участников
              </div>
            </div>
            
            <div className="chat-messages">
              {filteredMessages.length === 0 ? (
                <div className="no-messages-card">
                  <div className="no-messages-placeholder">Нет сообщений. Напишите первое сообщение!</div>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isMine = msg.userId === user.id;
                  let sender = usersInfo[msg.userId];
                  if (!sender && currentChat?.users) {
                    sender = currentChat.users.find(u => u.id === msg.userId);
                  }
                  
                  return (
                    <div key={msg.id} className={`message-wrapper ${isMine ? 'message-mine' : 'message-other'}`}>
                      {!isMine && (
                        <div 
                          className="message-avatar" 
                          onClick={() => openPrivateChat(msg.userId)}
                          title={`Написать ${sender?.name || 'пользователю'}`}
                        >
                          <span>{sender?.name?.[0] || '?'}</span>
                        </div>
                      )}
                      
                      <div className="message-bubble-wrapper">
                        {!isMine && <div className="message-sender-name">{sender?.name}</div>}
                        <div className="message-bubble">
                          <div className="message-text">{msg.text}</div>
                          <div className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      
                      {isMine && (
                        <div className="message-avatar message-avatar-mine">
                          <span>{user.name?.[0] || 'Я'}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="chat-input-container">
              <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><SmileIcon /></button>
              <label className="file-btn"><AttachIcon /><input type="file" hidden /></label>
              <input type="text" className="chat-input" placeholder="Введите сообщение..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessages()} />
              <button className="send-btn" onClick={sendMessages}>Отправить</button>
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