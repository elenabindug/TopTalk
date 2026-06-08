const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // убедимся, что decoded содержит userId и role
    return { userId: decoded.userId, role: decoded.role };
  } catch (err) {
    throw new Error('Invalid token');
  }
}

module.exports = { generateToken, verifyToken };
