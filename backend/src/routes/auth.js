const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { sendVerificationCode } = require('../utils/mailer');

const router = express.Router();
const prisma = new PrismaClient();

// Временное хранилище кодов (в реальном проекте используй БД или Redis)
const codes = new Map();

// Генерация 6-значного кода
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Проверка, существует ли уже такой email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя (роль по умолчанию 'student' из схемы)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Генерируем JWT токен, включая роль
    const token = generateToken(user.id, user.role);

    // Отправляем ответ (токен и данные пользователя без пароля)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Логин пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя по email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Сравниваем пароль
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерируем токен
    const token = generateToken(user.id, user.role);

    // Отправляем ответ
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// ========== ВОССТАНОВЛЕНИЕ ПАРОЛЯ ==========

// Шаг 1: Запрос на смену пароля — отправка кода на почту
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' });
    }

    const code = generateCode();
    codes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 }); // 10 минут

    const sent = await sendVerificationCode(email, code);
    if (!sent) {
      return res.status(500).json({ error: 'Ошибка отправки письма. Попробуйте позже.' });
    }

    res.json({ message: 'Код подтверждения отправлен на почту' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Шаг 2: Подтверждение кода и смена пароля
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const record = codes.get(email);
    if (!record) {
      return res.status(400).json({ error: 'Код не найден. Запросите новый код.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ error: 'Неверный код подтверждения' });
    }

    if (record.expires < Date.now()) {
      codes.delete(email);
      return res.status(400).json({ error: 'Срок действия кода истёк. Запросите новый.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    codes.delete(email);
    res.json({ message: 'Пароль успешно изменён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при смене пароля' });
  }
});

// Смена пароля для авторизованных пользователей
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const passwordValid = await bcrypt.compare(oldPassword, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Неверный старый пароль' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Пароль успешно изменён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при смене пароля' });
  }
});

module.exports = router;