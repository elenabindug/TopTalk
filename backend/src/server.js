const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Подключение роутов (добавим позже)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/chats', require('./routes/chats'));
// app.use('/api/messages', require('./routes/messages'));

// Socket.IO логика – будет позже
io.on('connection', (socket) => {
  console.log('Новый клиент подключен', socket.id);
  socket.on('disconnect', () => {
    console.log('Клиент отключился', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});