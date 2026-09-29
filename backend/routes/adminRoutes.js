const express = require('express');
const router = express.Router();
const { getAdminStats, addResource } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.post('/resources', protect, authorize('admin'), addResource);

module.exports = router;
