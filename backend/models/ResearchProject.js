const mongoose = require('mongoose');

const researchProjectSchema = new mongoose.Schema({
  projectId: {
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
  shortDescription: {
    type: String,
    required: true
  },
  description: {
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
  year: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    default: '2022 - 2025'
  },
  stationId: {
    type: String,
    required: true
  },
  stationName: {
    type: String,
    required: true
  },
  expeditionId: {
    type: String,
    required: true
  },
  expeditionName: {
    type: String,
    required: true
  },
  leadResearcher: {
    name: { type: String, required: true },
    designation: { type: String },
    institute: { type: String, default: 'NCPOR' },
    email: { type: String },
    orcid: { type: String }
  },
  collaboratingInstitutes: [{
    type: String
  }],
  methodology: {
    type: String
  },
  keyFindings: [{
    type: String
  }],
  keywords: [{
    type: String
  }],
  studentExplanation: {
    summary: { type: String },
    whyItMatters: { type: String },
    keyConcepts: [{ type: String }],
    funFact: { type: String }
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResearchProject', researchProjectSchema);
