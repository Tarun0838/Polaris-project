const express = require('express');
const router = express.Router();
const { getExpeditions, getExpeditionById, createExpedition } = require('../controllers/expeditionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getExpeditions);
router.get('/:id', getExpeditionById);
router.post('/', protect, authorize('admin'), createExpedition);

module.exports = router;
