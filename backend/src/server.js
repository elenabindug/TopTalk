const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/ping', (req, res) => res.json({ pong: true }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/users', require('./routes/users'));

const io = new Server(server, {
  cors: corsOptions,
});

// Middleware для сокетов - проверка JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: no token'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ Клиент подключился: ${socket.id}, userId: ${socket.userId}`);

  socket.on('join-chat', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`📌 Пользователь ${socket.userId} присоединился к чату ${chatId}`);
  });

  socket.on('send-message', async (data) => {
    const { chatId, text } = data;
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const chat = await prisma.chat.findFirst({
        where: { id: chatId, users: { some: { id: socket.userId } } },
      });
      if (!chat) {
        socket.emit('error', 'Нет доступа к этому чату');
        return;
      }

      const message = await prisma.message.create({
        data: {
          text,
          userId: socket.userId,
          chatId,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

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

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});