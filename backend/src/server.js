const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Загрузка переменных окружения (должна быть первой)
dotenv.config();

const app = express();
const server = http.createServer(app);

// Настройка CORS для Express и Socket.IO
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.use(express.json()); // парсинг JSON тела запросов

// ========== Тестовые маршруты ==========
app.get('/ping', (req, res) => res.json({ pong: true }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ========== API маршруты ==========
app.use('/api/auth', require('./routes/auth'));      // регистрация, логин, смена пароля
app.use('/api/chats', require('./routes/chats'));    // работа с чатами (будет создан)
app.use('/api/messages', require('./routes/messages')); // сообщения (будет создан)
app.use('/api/announcements', require('./routes/announcements')); // объявления (будет создан)
app.use('/api/users', require('./routes/users'));

// ========== Socket.IO с аутентификацией ==========
const io = new Server(server, {
  cors: corsOptions,
});

// Middleware для сокетов: проверка JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: no token'));
  }
  try {
    const { verifyToken } = require('./utils/jwt');
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ Клиент подключился: ${socket.id}, userId: ${socket.userId}`);

  // Присоединение к комнате чата
  socket.on('join-chat', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`📌 Пользователь ${socket.userId} присоединился к чату ${chatId}`);
  });

  // Отправка сообщения
  socket.on('send-message', async (data) => {
    const { chatId, text } = data;
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Проверяем, есть ли у пользователя доступ к чату
      const chat = await prisma.chat.findFirst({
        where: { id: chatId, users: { some: { id: socket.userId } } },
      });
      if (!chat) {
        socket.emit('error', 'Нет доступа к этому чату');
        return;
      }

      // Сохраняем сообщение в БД
      const message = await prisma.message.create({
        data: {
          text,
          userId: socket.userId,
          chatId,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      // Отправляем всем в комнате
      io.to(`chat:${chatId}`).emit('new-message', message);
    } catch (err) {
      console.error(err);
      socket.emit('error', 'Ошибка при отправке сообщения');
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Клиент отключился: ${socket.id}`);
  });
});

// ========== Запуск сервера ==========
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
