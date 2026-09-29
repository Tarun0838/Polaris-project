const express = require('express');
const router = express.Router();
const { getMedia, getMediaById } = require('../controllers/mediaController');

router.get('/', getMedia);
router.get('/:id', getMediaById);

module.exports = router;
