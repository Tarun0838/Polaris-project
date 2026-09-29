const Media = require('../models/Media');

// @desc    Get all media items
// @route   GET /api/media
// @access  Public
const getMedia = async (req, res, next) => {
  try {
    const { region, category, station } = req.query;
    const filter = {};
    if (region && region !== 'All') filter.region = region;
    if (category && category !== 'All') filter.category = category;
    if (station && station !== 'All') filter.stationId = station.toLowerCase();

    const media = await Media.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: media.length, data: media });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single media item
// @route   GET /api/media/:id
// @access  Public
const getMediaById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const item = await Media.findOne({
      $or: [{ mediaId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!item) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedia,
  getMediaById
};
