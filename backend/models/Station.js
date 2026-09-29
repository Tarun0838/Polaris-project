const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    enum: ['Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean']
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  establishedYear: {
    type: Number,
    required: true
  },
  operationalStatus: {
    type: String,
    enum: ['Year-round Active', 'Seasonal Active', 'Decommissioned'],
    default: 'Year-round Active'
  },
  description: {
    type: String,
    required: true
  },
  scienceFocus: [{
    type: String
  }],
  facilities: [{
    type: String
  }],
  altitude: {
    type: String
  },
  capacity: {
    winter: { type: Number, default: 25 },
    summer: { type: Number, default: 45 }
  },
  heroImage: {
    type: String
  },
  sourceType: {
    type: String,
    default: 'official_npdc'
  },
  sourceUrl: {
    type: String,
    default: 'https://npdc.ncpor.res.in'
  },
  verificationStatus: {
    type: String,
    default: 'official-source-verified'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Station', stationSchema);
