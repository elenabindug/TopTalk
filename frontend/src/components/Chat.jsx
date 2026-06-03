import useAuthStore from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import { getChats } from '../api/chats';
import { sendMessage } from '../api/messages';
import { useNavigate } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import './Chat.css';

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

function Chat({ onLogout }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = user?.token;
  const logout = useAuthStore((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats] = useState([
    { id: 1, name: "Общий чат" },
    { id: 2, name: "С Леной" }
  ]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = useSocket(token);

  // ========== ЗАГРУЗКА ДАННЫХ ПРИ СТАРТЕ ==========
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed);
    }

    getChats().then(res => {
      console.log('Чаты с сервера (заглушка):', res.data);
    });
  }, []);

  // ========== СОХРАНЕНИЕ СООБЩЕНИЙ ==========
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // ========== ФИЛЬТРАЦИЯ ЧАТОВ ПО ПОИСКУ ==========
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========== ОТПРАВКА СООБЩЕНИЯ ==========
  const sendMessages = () => {
    const trimmedText = inputText.trim();
    if (trimmedText === "") return;

    const newMessage = {
      id: Date.now(),
      text: trimmedText,
      senderId: user?.id || 1,
      chatId: activeChatId,
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    sendMessage(activeChatId, trimmedText).then(res => {
      if (socket) {
        socket.emit('send-message', {
          chatId: activeChatId,
          text: trimmedText,
        });
      }
    });

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

// Закрыть меню при клике вне его
useEffect(() => {
  const handleClickOutside = (event) => {
    // Проверяем, что меню открыто и клик был не по меню и не по кнопке-бургеру
    if (isMenuOpen && 
        !event.target.closest('.floating-menu') && 
        !event.target.closest('.icon-button')) {
      setIsMenuOpen(false);
    }
  };

  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, [isMenuOpen]);

  // ========== СОКЕТЫ ==========
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      };
      socket.on('receive-message', handleNewMessage);
      return () => {
        socket.off('receive-message', handleNewMessage);
      };
    }
  }, [socket]);

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div className="chat-container">
      {/* ЛЕВАЯ ПАНЕЛЬ (ЧАТЫ) */}
      <aside className={`chat-sidebar ${isMenuOpen ? 'shifted' : ''}`}>
        <div className="sidebar-header">
          <button className="icon-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <BurgerIcon />
          </button>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="chats-list">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div className="chat-avatar"></div>
              <span className="chat-name">{chat.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ВЫПАДАЮЩЕЕ МЕНЮ (ПОВЕРХ, ПРИ НАЖАТИИ НА БУРГЕР) */}
      {isMenuOpen && (
        <div className="floating-menu">
          <div className="floating-menu-header">
            <div className="user-avatar"></div>
            <div className="user-info">
              <span className="user-nickname">{user?.username || 'Пользователь'}</span>
            </div>
          </div>
          <nav className="floating-menu-nav">
            <button className="floating-menu-item" onClick={() => { navigate('/info'); setIsMenuOpen(false); }}>
              <span className="menu-icon"><InfoIcon /></span>
              Объявления
            </button>
            <button className="floating-menu-item" onClick={() => { navigate('/settings'); setIsMenuOpen(false); }}>
              <span className="menu-icon"><SettingsIcon /></span>
              Настройки
            </button>
            <button className="floating-menu-item logout" onClick={handleLogout}>
              <span className="menu-icon"><LogoutIcon /></span>
              Выйти
            </button>
          </nav>
        </div>
      )}

      {/* ПРАВАЯ ПАНЕЛЬ (ЧАТ) */}
      <main className="chat-main">
        {!activeChatId ? (
          <div className="chat-placeholder-pill">
            Выберите, кому хотели бы написать
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h2>{chats.find(c => c.id === activeChatId)?.name || 'Чат'}</h2>
            </div>
            <div className="chat-messages">
              {messages
                .filter(msg => msg.chatId === activeChatId)
                .map(msg => (
                  <div key={msg.id} className={`message ${msg.senderId === user?.id ? 'message-mine' : 'message-other'}`}>
                    <div className="message-bubble">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{msg.time || formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                ))}
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
              <button className="send-btn" onClick={sendMessages}>Отправить</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Chat;