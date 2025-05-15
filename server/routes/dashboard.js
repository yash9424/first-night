const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/dashboardController');

// Get dashboard statistics (admin only)
router.get('/stats', [auth, adminAuth], getStats);

module.exports = router; 