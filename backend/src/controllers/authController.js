const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { sendError } = require('../utils');

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { email, password, name, role = 'PROVIDER', ...profileData } = req.body;  // profileData matches registration fields

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return sendError(res, 400, 'Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        providerProfile: role === 'PROVIDER' ? { create: profileData } : undefined,
      },
      include: { providerProfile: true },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1d' });

    res.json({ success: true, data: { user, token } });
  } catch (err) {
    sendError(res, 500, 'Registration failed');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendError(res, 401, 'Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, 'Invalid credentials');

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1d' });

    res.json({ success: true, data: { user, token } });
  } catch (err) {
    sendError(res, 500, 'Login failed');
  }
};

module.exports = { register, login };
