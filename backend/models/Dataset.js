const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  datasetId: {
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
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'Observational In-Situ Data'
  },
  scienceDomain: {
    type: String,
    required: true,
    enum: ['Cryosphere', 'Atmosphere', 'Oceanography', 'Biology', 'Geophysics', 'Climate Science']
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
  expeditionName: {
    type: String
  },
  projectId: {
    type: String
  },
  year: {
    type: Number,
    required: true
  },
  temporalCoverage: {
    start: { type: String },
    end: { type: String }
  },
  spatialCoverage: {
    latMin: { type: Number },
    latMax: { type: Number },
    lngMin: { type: Number },
    lngMax: { type: Number }
  },
  parameters: [{
    type: String
  }],
  format: {
    type: String,
    default: 'NetCDF / CSV'
  },
  fileSize: {
    type: String,
    default: '45.2 MB'
  },
  provider: {
    type: String,
    default: 'NPDC - National Polar Data Centre / NCPOR'
  },
  accessType: {
    type: String,
    enum: ['Open Access', 'Request Data via NPDC'],
    default: 'Request Data via NPDC'
  },
  officialNotice: {
    type: String,
    default: 'Access through official NPDC source. User registration on National Polar Data Centre portal required.'
  },
  sourceUrl: {
    type: String,
    required: true
  },
  license: {
    type: String,
    default: 'MoES Data Policy 2022'
  },
  verificationStatus: {
    type: String,
    default: 'official-source-verified'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedByName: {
    type: String,
    default: ''
  },
  citation: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dataset', datasetSchema);
