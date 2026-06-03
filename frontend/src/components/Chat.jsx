import useAuthStore from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import { getChats } from '../api/chats';
import { sendMessage } from '../api/messages';
import { useNavigate } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import './Chat.css';

function Chat({ onLogout }) {  // ← добавили onLogout в пропсы
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = user?.token;
  const logout = useAuthStore((state) => state.logout);
  const [chat] = useState([
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
      console.log('Загружено сообщений из localStorage:', parsed.length);
    }

    const savedChatId = localStorage.getItem('activeChatId');
    if (savedChatId) {
      const id = parseInt(savedChatId);
      setActiveChatId(id);
      console.log('Загружен активный чат ID:', id);
    }

    getChats().then(res => {
      console.log('Чаты с сервера (заглушка):', res.data);
    });
  }, []);

  // ========== СОХРАНЕНИЕ СООБЩЕНИЙ ==========
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
      console.log('Сохранено сообщений в localStorage:', messages.length);
    }
  }, [messages]);

  // ========== СОХРАНЕНИЕ АКТИВНОГО ЧАТА ==========
  useEffect(() => {
    if (activeChatId !== null) {
      localStorage.setItem('activeChatId', activeChatId);
    }
  }, [activeChatId]);

  // ========== ОТПРАВКА СООБЩЕНИЯ ==========
  function sendMessages() {
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
      console.log('Результат отправки (заглушка):', res.data);
    });

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  }

  // ========== СОКЕТЫ ==========
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        console.log('Новое сообщение через сокет:', newMessage);
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

  // Обработчик выхода
  const handleLogout = () => {
    logout();
    if (onLogout) onLogout(); // ← уведомляем App, что пользователь вышел
    navigate('/login');
  };

  return (
    <div className="chat-container" style={{ display: 'flex', height: '100vh' }}>
      {/* ЛЕВАЯ КОЛОНКА */}
      <div className="chat-sidebar" style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <h3>Чаты</h3>
        <div style={{ flex: 1 }}>
          {chat.map(chat => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              style={{
                padding: '8px',
                marginBottom: '4px',
                background: activeChatId === chat.id ? '#e0e0e0' : 'transparent',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              {chat.name}
            </div>
          ))}
        </div>
        <button onClick={handleLogout} style={{ marginTop: '20px' }}>Выйти</button>
      </div>

      {/* ПРАВАЯ КОЛОНКА */}
      <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px' }}>
        {!activeChatId ? (
          <p>Выберите чат из списка слева</p>
        ) : (
          <>
            <h2>Чат</h2>
            <div className="chat-messages" style={{ flex: 1, border: '1px solid #eee', padding: '10px', overflowY: 'auto' }}>
              {messages
                .filter(msg => msg.chatId === activeChatId)
                .map(msg => (
                  <div key={msg.id} style={{ marginBottom: '12px', textAlign: msg.senderId === user?.id ? 'right' : 'left' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      backgroundColor: msg.senderId === user?.id ? '#dcf8c5' : '#ffffff',
                      border: msg.senderId === user?.id ? 'none' : '1px solid #e0e0e0',
                      maxWidth: '70%'
                    }}>
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                        {msg.time || formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid #ccc' }}
                placeholder="Введите сообщение..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessages()}
              />
              <button onClick={sendMessages} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#5b21e8', color: '#fff' }}>Отправить</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;