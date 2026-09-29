const mongoose = require('mongoose');

const generatedContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  keyFacts: [{
    type: String
  }],
  contentType: {
    type: String,
    required: true,
    enum: [
      'Simple Explanation',
      'Website Article',
      'Social Media Post',
      'Image Caption',
      'Short Video Script',
      'Key Facts',
      'Educational Summary'
    ]
  },
  audience: {
    type: String,
    required: true,
    enum: [
      'School Student',
      'College Student',
      'General Public',
      'Research Audience'
    ]
  },
  projectId: {
    type: String,
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  sourceIds: [{
    type: String
  }],
  sourceReferences: [{
    title: { type: String, required: true },
    type: { type: String, default: 'Research Metadata' },
    url: { type: String, required: true },
    identifier: { type: String }
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: {
    type: String,
    default: 'POLARIS Intelligence Engine'
  },
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'rejected', 'published'],
    default: 'draft'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewerName: {
    type: String
  },
  reviewComment: {
    type: String
  },
  isCuratorVerified: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GeneratedContent', generatedContentSchema);
