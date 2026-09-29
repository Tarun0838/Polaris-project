const express = require('express');
const router = express.Router();
const { getEducationalTopics, getTopicBySlug } = require('../controllers/educationController');

router.get('/', getEducationalTopics);
router.get('/:slug', getTopicBySlug);

module.exports = router;
