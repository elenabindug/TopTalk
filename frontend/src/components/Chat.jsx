import useAuthStore from '../store/useAuthStore.mock';
import { useState, useEffect } from 'react';
import { getChats } from '../api/chats';
import { sendMessage } from '../api/messages';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [chat] = useState([
    {id: 1, name: "Общий чат"},
    {id: 2, name: "С Леной"}
  ]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

function sendMessages(){
    console.log('Функция sendMessages вызвана');
    console.log('inputText до trim:', inputText);
    console.log('trimmedText:', inputText.trim());
    const trimmedText = inputText.trim();
    if (trimmedText === ""){
        return;
    }
    const newMessage = {
        id: Date.now(),
        text: trimmedText,
        senderId: user.id,
        chatId: activeChatId,
        createdAt: new Date().toISOString()
};
    sendMessage(activeChatId, trimmedText).then(res => {
      console.log('Результат отправки (заглушка):', res.data);
});
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
}

console.log('Все сообщения:', messages);

useEffect(() => {
  getChats().then(res => {
    console.log('Чаты с сервера (заглушка):', res.data);
  });
}, []);

  return (
  <div style={{ display: 'flex', height: '100vh' }}>
    {/* ЛЕВАЯ КОЛОНКА — СПИСОК ЧАТОВ */}
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
      <h3>Чаты</h3>
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
       <button onClick={() => {
              logout();
              navigate('/login');
              }}>Выйти</button>
    </div>

    {/* ПРАВАЯ КОЛОНКА — ОКНО ЧАТА */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {!activeChatId ? (
        <p>Выберите чат из списка слева</p>
      ) : (
        <>
          <h2>Чат</h2>
          {/* Здесь потом будут сообщения */}
          <div style={{ flex: 1, border: '1px solid #eee', padding: '10px', overflowY: 'auto' }}>
            <div>
                {messages
                    .filter(msg => msg.chatId === activeChatId)
                    .map(msg => (
            <div key={msg.id}>
            <strong>{msg.senderId === user.id ? 'Я' : 'Собеседник'}:</strong> {msg.text}
            </div>
            ))}
            </div>
          </div>
          {/* Здесь потом будет форма отправки */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
            style={{ flex: 1, padding: '8px' }}
            placeholder="Введите сообщение..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
        />
        </div>
        </>
      )}
    </div>
  </div>
);
}

export default Chat;