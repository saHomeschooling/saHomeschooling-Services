const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getProviders, getProviderById, updateProvider, approveProvider, rejectProvider } = require('../controllers/providerController');

const router = express.Router();

router.get('/', authMiddleware(['ADMIN']), getProviders);
router.get('/:id', authMiddleware(['ADMIN', 'PROVIDER']), getProviderById);
router.put('/:id', authMiddleware(['ADMIN', 'PROVIDER']), updateProvider);
router.post('/:id/approve', authMiddleware(['ADMIN']), approveProvider);
router.post('/:id/reject', authMiddleware(['ADMIN']), rejectProvider);

module.exports = router;
