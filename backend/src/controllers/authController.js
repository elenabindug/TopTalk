const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже используется' });
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email, name } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { register, login };