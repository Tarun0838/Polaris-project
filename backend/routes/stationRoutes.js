const express = require('express');
const router = express.Router();
const { getStations, getStationById, createStation, updateStation } = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getStations);
router.get('/:id', getStationById);
router.post('/', protect, authorize('admin'), createStation);
router.patch('/:id', protect, authorize('admin'), updateStation);

module.exports = router;
