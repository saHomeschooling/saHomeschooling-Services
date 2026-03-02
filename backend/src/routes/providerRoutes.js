// backend/src/routes/providerRoutes.js
const express        = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createProvider,
  getProviders,
  getProviderById,
  updateProvider,
  approveProvider,
  rejectProvider,
} = require('../controllers/providerController');

const router = express.Router();

// ── Public routes (no auth required) ─────────────────────────
// POST is open so the Registration.js form can create a profile
router.post('/',    createProvider);

// GET all / GET single are public so the homepage and profile
// pages can display providers without the user being logged in
router.get('/',     getProviders);
router.get('/:id',  getProviderById);

// ── Authenticated routes ──────────────────────────────────────
router.put('/:id',          authMiddleware(['ADMIN', 'PROVIDER']), updateProvider);
router.post('/:id/approve', authMiddleware(['ADMIN']),             approveProvider);
router.post('/:id/reject',  authMiddleware(['ADMIN']),             rejectProvider);

module.exports = router;