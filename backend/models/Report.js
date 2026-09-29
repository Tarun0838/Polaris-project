const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
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
  reportType: {
    type: String,
    enum: ['Scientific Technical Report', 'Annual Expedition Report', 'Environmental Impact Assessment', 'Logistics Report'],
    default: 'Scientific Technical Report'
  },
  year: {
    type: Number,
    required: true
  },
  expeditionId: {
    type: String
  },
  expeditionName: {
    type: String
  },
  stationId: {
    type: String
  },
  stationName: {
    type: String
  },
  region: {
    type: String,
    required: true,
    enum: ['Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean']
  },
  projectId: {
    type: String
  },
  summary: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    default: 48
  },
  authoringBody: {
    type: String,
    default: 'National Centre for Polar and Ocean Research (NCPOR), MoES'
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

module.exports = mongoose.model('Report', reportSchema);
