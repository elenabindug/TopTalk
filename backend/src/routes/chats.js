const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/chats — список чатов пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /chats для userId: ${req.userId}`);
    const chats = await prisma.chat.findMany({
      where: { users: { some: { id: req.userId } } },
      include: {
        users: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json(chats || []);
  } catch (err) {
    console.error('Ошибка в GET /chats:', err);
    res.status(500).json({ error: 'Ошибка загрузки чатов', details: err.message });
  }
});

// GET /api/chats/:id — конкретный чат с сообщениями
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, users: { some: { id: req.userId } } },
      include: {
        users: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
    if (!chat) return res.status(404).json({ error: 'Чат не найден' });
    res.json(chat);
  } catch (err) {
    console.error('Ошибка в GET /chats/:id:', err);
    res.status(500).json({ error: 'Ошибка загрузки чата', details: err.message });
  }
});

// POST /api/chats — создание чата
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, isGroup, userIds } = req.body;
    
    console.log('Создание чата:', { name, isGroup, userIds, currentUser: req.userId });
    
    // Для личного чата - проверяем существующий
    if (!isGroup && userIds && userIds.length === 1) {
      const otherUserId = userIds[0];
      
      // Ищем существующий личный чат
      const existingChat = await prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [
            { users: { some: { id: req.userId } } },
            { users: { some: { id: otherUserId } } }
          ]
        },
        include: {
          users: { select: { id: true, name: true, email: true } },
        },
      });
      
      if (existingChat) {
        console.log('Существующий чат найден:', existingChat.id);
        return res.json(existingChat);
      }
    }
    
    // Создаем новый чат
    const membersIds = Array.isArray(userIds) ? userIds : [];
    const allMemberIds = [req.userId, ...membersIds];
    
    const chat = await prisma.chat.create({
      data: {
        name: isGroup ? name : null,
        isGroup: isGroup || false,
        users: {
          connect: allMemberIds.map(id => ({ id })),
        },
      },
      include: {
        users: { select: { id: true, name: true, email: true } },
      },
    });
    
    console.log('Новый чат создан:', chat.id);
    res.json(chat);
  } catch (err) {
    console.error('Ошибка в POST /chats:', err);
    res.status(500).json({ error: 'Ошибка создания чата', details: err.message });
  }
});

// POST /api/chats/:id/members — добавить участника
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await prisma.chat.update({
      where: { id: req.params.id },
      data: { users: { connect: { id: userId } } },
      include: { users: { select: { id: true, name: true, email: true } } },
    });
    res.json(chat);
  } catch (err) {
    console.error('Ошибка добавления участника:', err);
    res.status(500).json({ error: 'Ошибка добавления участника', details: err.message });
  }
});

// DELETE /api/chats/:id/members/:userId — удалить участника
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const chat = await prisma.chat.update({
      where: { id: req.params.id },
      data: { users: { disconnect: { id: req.params.userId } } },
      include: { users: { select: { id: true, name: true, email: true } } },
    });
    res.json(chat);
  } catch (err) {
    console.error('Ошибка удаления участника:', err);
    res.status(500).json({ error: 'Ошибка удаления участника', details: err.message });
  }
});

module.exports = router;