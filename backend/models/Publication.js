const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  publicationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: [{
    type: String,
    required: true
  }],
  journal: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  volume: {
    type: String
  },
  issue: {
    type: String
  },
  pages: {
    type: String
  },
  doi: {
    type: String,
    required: true
  },
  abstract: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true,
    enum: ['Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean']
  },
  scienceDomain: {
    type: String,
    required: true,
    enum: ['Cryosphere', 'Atmosphere', 'Oceanography', 'Biology', 'Geophysics', 'Climate Science']
  },
  stationId: {
    type: String
  },
  stationName: {
    type: String
  },
  projectId: {
    type: String
  },
  sourceUrl: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: String,
    default: 'official-source-verified'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Publication', publicationSchema);
