import { useState, useEffect, useRef } from 'react';
import StudentAnnouncements from './StudentAnnouncements';
import './StudentChat.css';

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

function StudentChat({ onLogout, onChangePassword }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats] = useState([
    { id: 1, name: "Общий чат", avatar: "👥" },
    { id: 2, name: "С Леной", avatar: "👤" },
    { id: 3, name: "С Преподавателем", avatar: "👨‍🏫" }
  ]);

  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

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
        },
        {
          id: 2,
          text: 'Привет! Как дела?',
          senderId: 2,
          senderName: 'Лена',
          chatId: 2,
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

  if (showAnnouncements) {
    return <StudentAnnouncements onBack={() => setShowAnnouncements(false)} />;
  }

  const filteredMessages = messages.filter(msg => msg.chatId === activeChatId);
  const activeChat = chats.find(c => c.id === activeChatId);

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
          <h3 style={{ color: 'white', margin: 0 }}>TopTalk</h3>
        </div>
        
        <div className="chats-list">
          <div className="chat-category">Чаты</div>
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div className="chat-avatar">{chat.avatar}</div>
              <div className="chat-info">
                <span className="chat-name">{chat.name}</span>
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
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <span className="user-nickname">Студент</span>
                <span className="student-badge">Student</span>
              </div>
            </div>
            <nav className="floating-menu-nav">
              <button className="floating-menu-item" onClick={() => setShowAnnouncements(true)}>
                <span className="menu-icon">📢</span>
                Объявления
              </button>
              <button className="floating-menu-item" onClick={onChangePassword}>
                <span className="menu-icon">🔒</span>
                Сменить пароль
              </button>
              <button className="floating-menu-item logout" onClick={onLogout}>
                <span className="menu-icon">🚪</span>
                Выйти
              </button>
            </nav>
          </div>
        </>
      )}

      <main className="student-chat-main">
        {!activeChatId ? (
          <div className="chat-placeholder">
            Выберите чат
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h2>{activeChat?.name}</h2>
            </div>
            <div className="chat-messages">
              {filteredMessages.length === 0 ? (
                <div className="no-messages">
                  Нет сообщений. Напишите первое сообщение!
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
          </>
        )}
      </main>
    </div>
  );
}

export default StudentChat;