import { useState, useEffect, useRef } from 'react';
import StudentAnnouncements from './StudentAnnouncements';
import ChangePasswordStep1 from '../common/ChangePasswordStep1';
import ChangePasswordStep2 from '../common/ChangePasswordStep2';
import api from '../../api/axios';
import useSocket from '../../hooks/useSocket';
import './StudentChat.css';

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

function StudentChat({ onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const socket = useSocket(token);
  
  const [userData, setUserData] = useState({
    name: user.name || 'Студент',
    bio: user.bio || 'Люблю программирование и дизайн',
    avatar: user.avatar || ''
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
      
      const chatResponse = await api.get(`/chats/${activeChatId}`);
      setChats(prev => prev.map(c => c.id === activeChatId ? chatResponse.data : c));
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

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMessages = messages.filter(msg => msg.chatId === activeChatId);
  const activeChat = chats.find(c => c.id === activeChatId);

  const getHeaderStatus = () => {
    if (!activeChat) return '';
    if (activeChat.isGroup) {
      return `${activeChat.users?.length || 0} участников`;
    } else {
      const otherUser = activeChat.users?.find(u => u.id !== user.id);
      return otherUser?.name || 'Пользователь';
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
    return <StudentAnnouncements onBack={() => setShowAnnouncements(false)} />;
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="student-chat-container">
      <div className="student-chat-sidebar">
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
          {filteredChats.map(chat => (
            <div 
              key={chat.id}
              className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div className="chat-avatar"></div>
              <div className="chat-info">
                <div className="chat-name">{chat.name || (chat.users?.find(u => u.id !== user.id)?.name || 'Чат')}</div>
                {chat.messages?.[0] && (
                  <div className="chat-last-message">{chat.messages[0].text}</div>
                )}
              </div>
              <div className="chat-right">
                {chat.messages?.[0] && (
                  <div className="chat-time">
                    {new Date(chat.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div className="student-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div ref={menuRef} className="student-floating-menu">
            <div className="floating-menu-header">
              <div className="user-avatar"></div>
              <div className="user-info">
                <span className="user-nickname">{user.name || 'Студент'}</span>
                <span className="student-badge">Student</span>
              </div>
            </div>
            <nav className="floating-menu-nav">
              <button className="floating-menu-item" onClick={() => setShowProfileModal(true)}>
                <span className="menu-icon"><ProfileIcon /></span>
                Мой профиль
              </button>
              <button className="floating-menu-item" onClick={() => setShowAnnouncements(true)}>
                <span className="menu-icon"><AnnouncementIcon /></span>
                Объявления
              </button>
              <button className="floating-menu-item logout" onClick={onLogout}>
                <span className="menu-icon"><LogoutIcon /></span>
                Выйти
              </button>
            </nav>
          </div>
        </>
      )}

      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Профиль студента</h2>
              <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="profile-modal-body">
              <div className="profile-avatar-container">
                <div className="profile-avatar">
                  {!userData.avatar && <span className="avatar-placeholder">{userData.name?.[0] || 'С'}</span>}
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
                  <div className="profile-bio-text">{userData.bio || 'Добавьте описание профиля...'}</div>
                  <button className="profile-edit-btn" onClick={() => { setTempBio(userData.bio); setIsEditing(true); }}>Редактировать профиль</button>
                </>
              )}
              {isEditing && (
                <button className="profile-change-password-btn" onClick={() => { setShowProfileModal(false); handleChangePasswordStart(); }}>Сменить пароль</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="student-chat-main">
        {!activeChatId ? (
          <div className="chat-placeholder">
            <div className="placeholder-card">Выберите, кому хотели бы написать</div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-top">
                <h2>{activeChat.name || (activeChat.users?.find(u => u.id !== user.id)?.name || 'Чат')}</h2>
                <div className="chat-header-status">{getHeaderStatus()}</div>
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
                  const sender = activeChat?.users?.find(u => u.id === msg.userId);
                  
                  return (
                    <div key={msg.id} className={`message-wrapper ${isMine ? 'message-mine' : 'message-other'}`}>
                      {!isMine && (
                        <div 
                          className="message-avatar" 
                          onClick={() => {
                            const existingChat = chats.find(chat => 
                              !chat.isGroup && 
                              chat.users?.some(u => u.id === sender?.id) &&
                              chat.users?.some(u => u.id === user.id)
                            );
                            
                            if (existingChat) {
                              setActiveChatId(existingChat.id);
                            } else if (sender?.id) {
                              api.post('/chats', {
                                userIds: [user.id, sender.id],
                                isGroup: false
                              }).then(response => {
                                setChats(prev => [...prev, response.data]);
                                setActiveChatId(response.data.id);
                              }).catch(err => {
                                console.error('Ошибка создания чата:', err);
                                alert('Не удалось создать чат');
                              });
                            }
                          }}
                          title={`Написать ${sender?.name || 'пользователю'}`}
                        >
                          {sender?.avatar ? (
                            <img src={sender.avatar} alt={sender.name} />
                          ) : (
                            <span>{sender?.name?.[0] || '?'}</span>
                          )}
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
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                          ) : (
                            <span>{user.name?.[0] || 'Я'}</span>
                          )}
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

export default StudentChat;