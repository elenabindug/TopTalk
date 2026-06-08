import { useState, useEffect, useRef } from 'react';
import StudentAnnouncements from './StudentAnnouncements';
import ChangePasswordStep1 from '../common/ChangePasswordStep1';
import ChangePasswordStep2 from '../common/ChangePasswordStep2';
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

// Иконки для меню
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

// Иконки для смайлика и скрепки
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

function StudentChat({ onLogout }) {
  // ========== ВСЕ ХУКИ В НАЧАЛЕ ==========
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [userData, setUserData] = useState({
    name: 'Студент',
    bio: 'Люблю программирование и дизайн',
    avatar: ''
  });
  const [chats] = useState([
    { 
      id: 1, 
      name: "Общий чат", 
      lastMessage: "Привет всем!", 
      time: "12:30",
      online: 5,
      isGroup: true
    },
    { 
      id: 2, 
      name: "С Леной", 
      lastMessage: "Как дела?", 
      time: "11:45",
      isOnline: true,
      isGroup: false
    },
    { 
      id: 3, 
      name: "С Преподавателем", 
      lastMessage: "Когда сдавать проект?", 
      time: "вчера",
      isOnline: false,
      lastSeen: "вчера в 15:30",
      isGroup: false
    }
  ]);

  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  // ========== ВСЕ useEffect И ФУНКЦИИ ==========
  const addEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

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
    const savedMessages = localStorage.getItem('studentMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const testMessages = [
        {
          id: 1,
          text: 'Добро пожаловать в общий чат!',
          senderId: 1,
          senderName: 'Администратор',
          chatId: 1,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString()
        }
      ];
      setMessages(testMessages);
      localStorage.setItem('studentMessages', JSON.stringify(testMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('studentMessages', JSON.stringify(messages));
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
      senderId: 2,
      senderName: 'Студент',
      chatId: activeChatId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMessages = messages.filter(msg => msg.chatId === activeChatId);
  const activeChat = chats.find(c => c.id === activeChatId);

  const getHeaderStatus = () => {
    if (!activeChat) return '';
    if (activeChat.isGroup) {
      return `${activeChat.online} в сети`;
    } else {
      if (activeChat.isOnline) {
        return 'в сети';
      } else {
        return `был(а) ${activeChat.lastSeen}`;
      }
    }
  };

  const getChatStatus = (chat) => {
    if (chat.isGroup) {
      return <div className="chat-status online-count">{chat.online} в сети</div>;
    } else {
      if (chat.isOnline) {
        return <div className="chat-status online">в сети</div>;
      } else {
        return <div className="chat-status offline">{chat.lastSeen}</div>;
      }
    }
  };

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
    return <StudentAnnouncements onBack={() => setShowAnnouncements(false)} />;
  }

  // ========== ОСНОВНОЙ RETURN ==========
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
                <div className="chat-name">{chat.name}</div>
                {chat.lastMessage && (
                  <div className="chat-last-message">{chat.lastMessage}</div>
                )}
              </div>
              <div className="chat-right">
                <div className="chat-time">{chat.time}</div>
                {getChatStatus(chat)}
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
                <span className="user-nickname">Студент</span>
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

      {/* Модальное окно профиля */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Профиль студента</h2>
              <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}>
                ✕
              </button>
            </div>

            <div className="profile-modal-body">
              <div className="profile-avatar-container">
                <div 
                  className="profile-avatar" 
                  onClick={() => {
                    const newAvatar = prompt('Введите URL новой аватарки:', userData.avatar);
                    if (newAvatar !== null) setUserData({...userData, avatar: newAvatar});
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {!userData.avatar && <span className="avatar-placeholder">{userData.name?.[0] || 'С'}</span>}
                </div>
              </div>

              <div className="profile-name">{userData.name}</div>

              {isEditing ? (
                <>
                  <textarea
                    className="profile-bio-edit-input"
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    rows={3}
                    placeholder="Расскажите о себе..."
                  />
                  <button className="profile-save-btn" onClick={() => {
                    setUserData({...userData, bio: tempBio});
                    setIsEditing(false);
                  }}>
                    Сохранить
                  </button>
                </>
              ) : (
                <>
                  <div className="profile-bio-text">{userData.bio || 'Добавьте описание профиля...'}</div>
                  <button className="profile-edit-btn" onClick={() => {
                    setTempBio(userData.bio);
                    setIsEditing(true);
                  }}>
                    Редактировать профиль
                  </button>
                </>
              )}

              {isEditing && (
                <button className="profile-change-password-btn" onClick={() => {
                  setShowProfileModal(false);
                  handleChangePasswordStart();
                }}>
                  Сменить пароль
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="student-chat-main">
        {!activeChatId ? (
          <div className="chat-placeholder">
            <div className="placeholder-card">
              Выберите, кому хотели бы написать
            </div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-top">
                <h2>{activeChat?.name}</h2>
                <div className="chat-header-status">
                  {getHeaderStatus()}
                </div>
              </div>
            </div>
            <div className="chat-messages">
              {filteredMessages.length === 0 ? (
                <div className="no-messages-card">
                  <div className="no-messages-placeholder">
                    Нет сообщений. Напишите первое сообщение!
                  </div>
                </div>
              ) : (
                filteredMessages.map(msg => (
                  <div key={msg.id} className={`message ${msg.senderId === 2 ? 'message-mine' : 'message-other'}`}>
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
                <SmileIcon />
              </button>
              <label className="file-btn">
                <AttachIcon />
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

export default StudentChat;