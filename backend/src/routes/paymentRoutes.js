// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { verifyPaystackWebhook, initializePayment, verifyTransaction } = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/payments/initialize  — called by frontend to get a payment ref
router.post('/initialize', authMiddleware(), initializePayment);

// GET  /api/payments/verify/:reference  — verify a completed transaction
router.get('/verify/:reference', authMiddleware(), verifyTransaction);

// POST /api/payments/webhook  — Paystack sends server-side events here
router.post('/webhook', express.raw({ type: 'application/json' }), verifyPaystackWebhook);

module.exports = router;
