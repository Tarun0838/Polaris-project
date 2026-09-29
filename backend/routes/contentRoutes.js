const express = require('express');
const router = express.Router();
const {
  generateDraft,
  getContentList,
  getContentById,
  updateContent,
  submitForReview,
  reviewContent,
  publishContent
} = require('../controllers/contentController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.post('/generate', optionalAuth, generateDraft);
router.get('/', getContentList);
router.get('/:id', getContentById);
router.put('/:id', optionalAuth, updateContent);
router.patch('/:id/submit-review', optionalAuth, submitForReview);
router.patch('/:id/review', protect, authorize('admin'), reviewContent);
router.patch('/:id/publish', protect, authorize('admin'), publishContent);

module.exports = router;
