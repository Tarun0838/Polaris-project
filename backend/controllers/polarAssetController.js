const PolarAsset = require('../models/PolarAsset');
const fs = require('fs');
const path = require('path');

const getAssets = async (req, res, next) => {
  try {
    const { region, category, station, tag, q } = req.query;
    let query = {};

    if (region && region !== 'All') {
      if (region.toLowerCase().includes('himalay')) {
        query.region = { $in: ['Himalaya', 'Himalayas'] };
      } else {
        query.region = new RegExp(`^${region}$`, 'i');
      }
    }

    if (category && category !== 'All') {
      query.category = category.toLowerCase();
    }

    if (station && station !== 'All') {
      query.station = new RegExp(station, 'i');
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (q) {
      const qRegex = new RegExp(q, 'i');
      query.$or = [
        { title: qRegex },
        { summary: qRegex },
        { tags: qRegex },
        { station: qRegex }
      ];
    }

    let assets = [];
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        assets = await PolarAsset.find(query).sort({ year: -1, createdAt: -1 });
      } catch (e) {
        console.warn('[VYOM-ASSETS] MongoDB query failed:', e.message);
      }
    }

    // Fallback to polarAssets.json seed file if database query empty or offline
    if (!assets || assets.length === 0) {
      const seedPath = path.join(__dirname, '../seed/polarAssets.json');
      if (fs.existsSync(seedPath)) {
        try {
          const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
          assets = raw.filter(item => {
            if (region && region !== 'All') {
              const rLower = (item.region || '').toLowerCase();
              if (region.toLowerCase().includes('himalay')) {
                if (!rLower.includes('himalay')) return false;
              } else if (!rLower.includes(region.toLowerCase())) {
                return false;
              }
            }
            if (category && category !== 'All' && item.category.toLowerCase() !== category.toLowerCase()) return false;
            if (station && station !== 'All' && !item.station.toLowerCase().includes(station.toLowerCase())) return false;
            if (q) {
              const matchText = `${item.title} ${item.summary} ${(item.tags || []).join(' ')} ${item.station}`.toLowerCase();
              if (!matchText.includes(q.toLowerCase())) return false;
            }
            return true;
          });
        } catch (e) {}
      }
    }

    res.json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    next(error);
  }
};

const getAssetById = async (req, res, next) => {
  try {
    const asset = await PolarAsset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Polar asset record not found' });
    }
    res.json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  getAssetById
};
