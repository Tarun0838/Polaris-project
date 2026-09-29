const mongoose = require('mongoose');

const expeditionSchema = new mongoose.Schema({
  expeditionId: {
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
  shortName: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  startDate: {
    type: String
  },
  endDate: {
    type: String
  },
  region: {
    type: String,
    required: true,
    enum: ['Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean']
  },
  leader: {
    name: { type: String, required: true },
    designation: { type: String },
    institute: { type: String }
  },
  organization: {
    type: String,
    default: 'National Centre for Polar and Ocean Research (NCPOR)'
  },
  vessel: {
    type: String,
    default: 'MV Vasiliy Golovnin'
  },
  stations: [{
    type: String
  }],
  objectives: [{
    type: String
  }],
  summary: {
    type: String,
    required: true
  },
  participantsCount: {
    type: Number,
    default: 40
  },
  timeline: [{
    date: { type: String },
    title: { type: String },
    description: { type: String },
    milestone: { type: Boolean, default: false }
  }],
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expedition', expeditionSchema);
