const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  actorName: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    default: 'admin'
  },
  targetType: {
    type: String,
    enum: ['Content', 'ResearchProject', 'Dataset', 'Report', 'Publication', 'User', 'System'],
    required: true
  },
  targetId: {
    type: String
  },
  targetTitle: {
    type: String
  },
  details: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
