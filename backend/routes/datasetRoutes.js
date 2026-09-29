const express = require('express');
const router = express.Router();
const { getDatasets, getDatasetById, createDataset } = require('../controllers/datasetController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDatasets);
router.get('/:id', getDatasetById);
router.post('/', protect, authorize('researcher', 'admin'), createDataset);

module.exports = router;
