const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Media = require('../models/Media');

const loadSeedMedia = () => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '../seed/media.json'), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[POLARIS-MEDIA] Failed reading seed/media.json fallback:', err.message);
    return [];
  }
};

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

    let media = [];
    if (mongoose.connection.readyState === 1) {
      try {
        media = await Media.find(filter).sort({ createdAt: -1 }).lean();
      } catch (dbErr) {
        console.warn('[POLARIS-MEDIA] DB query failed, falling back to seed media.json:', dbErr.message);
      }
    }

    if (!media || media.length === 0) {
      let seedMedia = loadSeedMedia();
      if (region && region !== 'All') {
        seedMedia = seedMedia.filter(m => (m.region || '').toLowerCase() === region.toLowerCase());
      }
      if (category && category !== 'All') {
        seedMedia = seedMedia.filter(m => (m.category || '').toLowerCase() === category.toLowerCase());
      }
      if (station && station !== 'All') {
        seedMedia = seedMedia.filter(m => (m.stationId || '').toLowerCase() === station.toLowerCase());
      }
      media = seedMedia;
    }

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
    let item = null;
    if (mongoose.connection.readyState === 1) {
      try {
        item = await Media.findOne({
          $or: [{ mediaId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        }).lean();
      } catch (dbErr) {
        console.warn('[POLARIS-MEDIA] DB findOne failed, falling back to seed:', dbErr.message);
      }
    }

    if (!item) {
      const seedMedia = loadSeedMedia();
      item = seedMedia.find(m => m.mediaId === id || m._id === id);
    }

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
