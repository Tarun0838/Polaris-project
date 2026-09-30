const mongoose = require('mongoose');

const PolarAssetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    region: {
      type: String,
      required: true,
      enum: ['Antarctica', 'Himalaya', 'Himalayas', 'Arctic', 'Southern Ocean'],
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: ['report', 'dataset', 'media', 'activity'],
      index: true
    },
    station: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true }
    },
    year: { type: Number, required: true },
    sourceUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    tags: [{ type: String, index: true }],
    summary: { type: String, required: true },
    scientificMetrics: { type: Map, of: String, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PolarAsset', PolarAssetSchema);
