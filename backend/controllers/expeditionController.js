const Expedition = require('../models/Expedition');
const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const { generateExpeditionSynthesis } = require('../services/aiService');

// @desc    Get all expeditions
// @route   GET /api/expeditions
// @access  Public
const getExpeditions = async (req, res, next) => {
  try {
    const { region, year } = req.query;
    const filter = {};
    if (region && region !== 'All') filter.region = region;
    if (year && year !== 'All') filter.year = new RegExp(year, 'i');

    const expeditions = await Expedition.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: expeditions.length, data: expeditions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expedition with related resources
// @route   GET /api/expeditions/:id
// @access  Public
const getExpeditionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const expedition = await Expedition.findOne({
      $or: [{ expeditionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!expedition) {
      return res.status(404).json({ success: false, message: `Expedition '${id}' not found.` });
    }

    const projects = await ResearchProject.find({ expeditionId: expedition.expeditionId }).lean();
    const projectIds = projects.map(p => p.projectId).filter(Boolean);

    const [datasets, reports, publications, media] = await Promise.all([
      Dataset.find({ expeditionId: expedition.expeditionId }).lean(),
      Report.find({
        $or: [
          { expeditionId: expedition.expeditionId },
          ...(projectIds.length > 0 ? [{ projectId: { $in: projectIds } }] : [])
        ]
      }).lean(),
      Publication.find({
        $or: [
          { expeditionId: expedition.expeditionId },
          ...(projectIds.length > 0 ? [{ projectId: { $in: projectIds } }] : [])
        ]
      }).lean(),
      Media.find({ expeditionId: expedition.expeditionId }).lean()
    ]);

    res.json({
      success: true,
      data: {
        ...expedition,
        related: {
          projects,
          datasets,
          reports,
          publications,
          media
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate comprehensive synthesis report for an expedition
// @route   GET /api/expeditions/:id/synthesize
// @access  Public
const getExpeditionSynthesis = async (req, res, next) => {
  try {
    const id = req.params.id;
    const expedition = await Expedition.findOne({
      $or: [{ expeditionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!expedition) {
      return res.status(404).json({ success: false, message: `Expedition '${id}' not found.` });
    }

    const projects = await ResearchProject.find({ expeditionId: expedition.expeditionId }).lean();
    const projectIds = projects.map(p => p.projectId).filter(Boolean);

    const [datasets, reports, publications] = await Promise.all([
      Dataset.find({ expeditionId: expedition.expeditionId }).lean(),
      Report.find({
        $or: [
          { expeditionId: expedition.expeditionId },
          ...(projectIds.length > 0 ? [{ projectId: { $in: projectIds } }] : [])
        ]
      }).lean(),
      Publication.find({
        $or: [
          { expeditionId: expedition.expeditionId },
          ...(projectIds.length > 0 ? [{ projectId: { $in: projectIds } }] : [])
        ]
      }).lean()
    ]);

    const synthesis = await generateExpeditionSynthesis({
      expedition,
      projects,
      datasets,
      reports,
      publications
    });

    res.json({
      success: true,
      data: synthesis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expedition (admin only)
// @route   POST /api/expeditions
// @access  Admin
const createExpedition = async (req, res, next) => {
  try {
    const expedition = await Expedition.create(req.body);
    res.status(201).json({ success: true, data: expedition });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpeditions,
  getExpeditionById,
  getExpeditionSynthesis,
  createExpedition
};

