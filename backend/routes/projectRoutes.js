const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', protect, authorize('researcher', 'admin'), createProject);
router.patch('/:id', protect, authorize('researcher', 'admin'), updateProject);

module.exports = router;
