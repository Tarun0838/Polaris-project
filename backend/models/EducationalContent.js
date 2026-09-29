const mongoose = require('mongoose');

const educationalContentSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Antarctica', 'Arctic', 'Climate', 'Glaciers', 'Oceans', 'Polar Ecosystems', 'Indian Polar Expeditions', 'Polar Stations']
  },
  targetLevel: {
    type: String,
    enum: ['School Student', 'College Student', 'General Public'],
    default: 'School Student'
  },
  summary: {
    type: String,
    required: true
  },
  simpleExplanation: {
    type: String,
    required: true
  },
  whyItMatters: {
    type: String,
    required: true
  },
  keyConcepts: [{
    term: { type: String, required: true },
    definition: { type: String, required: true }
  }],
  importantFacts: [{
    type: String
  }],
  chartData: {
    title: { type: String },
    xAxisKey: { type: String },
    dataKey: { type: String },
    unit: { type: String },
    points: [{
      label: { type: String },
      value: { type: Number }
    }]
  },
  quiz: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true }
  }],
  relatedProjectId: {
    type: String
  },
  relatedDatasetId: {
    type: String
  },
  sourceReferences: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('EducationalContent', educationalContentSchema);
