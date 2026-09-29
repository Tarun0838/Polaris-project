const express = require('express');
const router = express.Router();
const { getPublications, getPublicationById } = require('../controllers/publicationController');

router.get('/', getPublications);
router.get('/:id', getPublicationById);

module.exports = router;
