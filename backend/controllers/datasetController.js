const Dataset = require('../models/Dataset');
const ResearchProject = require('../models/ResearchProject');
const Station = require('../models/Station');
const Expedition = require('../models/Expedition');
const Publication = require('../models/Publication');

// @desc    Get all datasets with filters
// @route   GET /api/datasets
// @access  Public
const getDatasets = async (req, res, next) => {
  try {
    const { region, domain, station, accessType, year } = req.query;
    const filter = {};

    if (region && region !== 'All') filter.region = new RegExp(`^${region}$`, 'i');
    if (domain && domain !== 'All') filter.scienceDomain = new RegExp(`^${domain}$`, 'i');
    if (station && station !== 'All') filter.stationId = station.toLowerCase();
    if (accessType && accessType !== 'All') filter.accessType = accessType;
    if (year && year !== 'All') filter.year = Number(year);

    const datasets = await Dataset.find(filter).sort({ year: -1 }).lean();
    res.json({ success: true, count: datasets.length, data: datasets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single dataset by ID with affiliated research
// @route   GET /api/datasets/:id
// @access  Public
const getDatasetById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const dataset = await Dataset.findOne({
      $or: [{ datasetId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!dataset) {
      return res.status(404).json({ success: false, message: `Dataset '${id}' not found.` });
    }

    const [affiliatedProject, relatedStation, relatedExpedition, relatedPublications] = await Promise.all([
      dataset.projectId ? ResearchProject.findOne({ projectId: dataset.projectId }).lean() : null,
      dataset.stationId ? Station.findOne({ stationId: dataset.stationId }).lean() : null,
      dataset.expeditionId ? Expedition.findOne({ expeditionId: dataset.expeditionId }).lean() : null,
      Publication.find({
        $or: [
          { projectId: dataset.projectId || '__none__' },
          { stationId: dataset.stationId || '__none__' }
        ]
      }).limit(5).lean()
    ]);

    res.json({
      success: true,
      data: {
        ...dataset,
        affiliatedProject,
        relatedStation,
        relatedExpedition,
        relatedPublications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create dataset metadata (admin/researcher)
// @route   POST /api/datasets
// @access  Researcher, Admin
const createDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.create(req.body);
    res.status(201).json({ success: true, data: dataset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDatasets,
  getDatasetById,
  createDataset
};
