const EducationalContent = require('../models/EducationalContent');
const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');

// @desc    Get all educational modules
// @route   GET /api/education
// @access  Public
const getEducationalTopics = async (req, res, next) => {
  try {
    const { category, targetLevel } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (targetLevel && targetLevel !== 'All') filter.targetLevel = targetLevel;

    const topics = await EducationalContent.find(filter).lean();
    res.json({ success: true, count: topics.length, data: topics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single educational topic by slug with linked real research & datasets
// @route   GET /api/education/:slug
// @access  Public
const getTopicBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const topic = await EducationalContent.findOne({ slug }).lean();

    if (!topic) {
      return res.status(404).json({ success: false, message: `Educational module '${slug}' not found.` });
    }

    let relatedProject = null;
    let relatedDataset = null;

    if (topic.relatedProjectId) {
      relatedProject = await ResearchProject.findOne({ projectId: topic.relatedProjectId }).lean();
    }
    if (topic.relatedDatasetId) {
      relatedDataset = await Dataset.findOne({ datasetId: topic.relatedDatasetId }).lean();
    }

    res.json({
      success: true,
      data: {
        ...topic,
        relatedProject,
        relatedDataset
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEducationalTopics,
  getTopicBySlug
};
