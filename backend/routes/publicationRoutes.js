const express = require('express');
const router = express.Router();
const { getPublications, getPublicationById, createPublication } = require('../controllers/publicationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPublications);
router.get('/:id', getPublicationById);
router.post('/', protect, authorize('researcher', 'admin'), createPublication);

module.exports = router;

