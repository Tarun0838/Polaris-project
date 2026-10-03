const express = require('express');
const router = express.Router();
const {
  handleFileUpload,
  uploadPublication,
  uploadProject,
  uploadDataset,
  getMySubmissions
} = require('../controllers/researchUploadController');
const { protect, authorize } = require('../middleware/auth');

// All research upload endpoints require researcher or admin role
router.post('/upload-file', protect, authorize('researcher', 'admin'), handleFileUpload);
router.post('/publication', protect, authorize('researcher', 'admin'), uploadPublication);
router.post('/project', protect, authorize('researcher', 'admin'), uploadProject);
router.post('/dataset', protect, authorize('researcher', 'admin'), uploadDataset);
router.get('/my-submissions', protect, authorize('researcher', 'admin'), getMySubmissions);

module.exports = router;
