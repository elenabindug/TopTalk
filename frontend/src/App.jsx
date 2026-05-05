import { useState, useEffect } from 'react';
import useChatStore from './store/useChatStore';

function App() {
  const { setUser: setZustandUser, addMessage } = useChatStore();

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const fakeUser = { id: 1, name: 'Анна' };
      setUser(fakeUser);          
      setZustandUser(fakeUser);   
    }, 1000);
  }, [setZustandUser]); 

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const newMessage = {
      id: Date.now(),
      text,
      senderId: user?.id || 1,
    };
    addMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: `Эхо: ${text}`,
        senderId: 999,
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  if (!user) return <div>Загрузка, вход...</div>;

  return (
    <div>
      <h1>Мессенджер</h1>
      <p>Привет, {user.name}!</p>
      <button onClick={() => sendMessage('Привет, мир!')}>
        Отправить
      </button>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.senderId === user.id ? 'Я' : 'Собеседник'}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;