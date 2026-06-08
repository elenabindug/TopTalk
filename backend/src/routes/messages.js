const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/messages/:chatId — история сообщений
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Проверка доступа к чату
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, users: { some: { id: req.userId } } },
    });
    if (!chat) return res.status(403).json({ error: 'Нет доступа к чату' });

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      include: { user: { select: { id: true, name: true } } },
    });

    res.json(messages.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки сообщений' });
  }
});

// POST /api/messages — отправить сообщение
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { chatId, text } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ error: 'chatId и text обязательны' });
    }

    // Проверка доступа
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, users: { some: { id: req.userId } } },
    });
    if (!chat) return res.status(403).json({ error: 'Нет доступа к чату' });

    const message = await prisma.message.create({
      data: { text, userId: req.userId, chatId },
      include: { user: { select: { id: true, name: true } } },
    });

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка отправки сообщения' });
  }
});

module.exports = router;
