const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/chats — список чатов пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /chats для userId: ${req.userId}`); // для отладки
    const chats = await prisma.chat.findMany({
      where: { users: { some: { id: req.userId } } },
      include: {
        users: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    // Всегда возвращаем массив (даже пустой)
    res.json(chats || []);
  } catch (err) {
    console.error('Ошибка в GET /chats:', err);
    res.status(500).json({ error: 'Ошибка загрузки чатов' });
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
    res.status(500).json({ error: 'Ошибка загрузки чата' });
  }
});

// POST /api/chats — создание чата
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, isGroup, userIds } = req.body;
    // Защита: userIds должен быть массивом
    const membersIds = Array.isArray(userIds) ? userIds : [];
    // Для личного чата можно автоматически сгенерировать имя
    const chatName = isGroup ? name : null;

    const chat = await prisma.chat.create({
      data: {
        name: chatName,
        isGroup: isGroup || false,
        users: {
          connect: [{ id: req.userId }, ...membersIds.map(id => ({ id }))],
        },
      },
      include: { users: true },
    });
    res.json(chat);
  } catch (err) {
    console.error('Ошибка в POST /chats:', err);
    res.status(500).json({ error: 'Ошибка создания чата' });
  }
});

// POST /api/chats/:id/members — добавить участника
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await prisma.chat.update({
      where: { id: req.params.id },
      data: { users: { connect: { id: userId } } },
    });
    res.json(chat);
  } catch (err) {
    console.error('Ошибка добавления участника:', err);
    res.status(500).json({ error: 'Ошибка добавления участника' });
  }
});

// DELETE /api/chats/:id/members/:userId — удалить участника
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const chat = await prisma.chat.update({
      where: { id: req.params.id },
      data: { users: { disconnect: { id: req.params.userId } } },
    });
    res.json(chat);
  } catch (err) {
    console.error('Ошибка удаления участника:', err);
    res.status(500).json({ error: 'Ошибка удаления участника' });
  }
});

module.exports = router;
