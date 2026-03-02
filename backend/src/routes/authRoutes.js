// backend/src/routes/authRoutes.js
const express        = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { register, login, getUsers } = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Admin only — used by the admin dashboard to list all users
router.get('/users', authMiddleware(['ADMIN']), getUsers);

module.exports = router;