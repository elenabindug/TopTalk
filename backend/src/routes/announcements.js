const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Проверка на админа
const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Ошибка проверки прав' });
  }
};

// GET /api/announcements — все объявления
router.get('/', authMiddleware, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } }
    });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки объявлений' });
  }
});

// POST /api/announcements — создать (только админ)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, text, groupIds } = req.body;
    
    const announcement = await prisma.announcement.create({
      data: {
        title: title || '',
        text: text,
        groupId: Array.isArray(groupIds) ? groupIds.join(',') : (groupIds || 'all'),
        authorId: req.userId
      }
    });
    
    res.json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка создания объявления' });
  }
});

// DELETE /api/announcements/:id — удалить (только админ)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

module.exports = router;