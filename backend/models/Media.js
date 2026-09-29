const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  mediaId: {
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
  type: {
    type: String,
    enum: ['image', 'infographic', 'video'],
    default: 'image'
  },
  category: {
    type: String,
    enum: ['Station', 'Expedition', 'Wildlife', 'Instrumentation', 'Fieldwork', 'Outreach'],
    default: 'Fieldwork'
  },
  url: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true,
    enum: ['Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean']
  },
  stationId: {
    type: String
  },
  stationName: {
    type: String
  },
  expeditionId: {
    type: String
  },
  projectId: {
    type: String
  },
  credit: {
    type: String,
    default: 'NCPOR / MoES Photographic Archive'
  },
  license: {
    type: String,
    default: 'Government of India - Open Access for Educational Outreach'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);
