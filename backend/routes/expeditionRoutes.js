const express = require('express');
const router = express.Router();
const {
  getExpeditions,
  getExpeditionById,
  getExpeditionSynthesis,
  createExpedition
} = require('../controllers/expeditionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getExpeditions);
router.get('/:id/synthesize', getExpeditionSynthesis);
router.post('/:id/synthesize', getExpeditionSynthesis);
router.get('/:id', getExpeditionById);
router.post('/', protect, authorize('admin'), createExpedition);

module.exports = router;

