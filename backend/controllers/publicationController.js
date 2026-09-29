const Publication = require('../models/Publication');
const ResearchProject = require('../models/ResearchProject');

// @desc    Get all publications with filters
// @route   GET /api/publications
// @access  Public
const getPublications = async (req, res, next) => {
  try {
    const { region, domain, year } = req.query;
    const filter = {};

    if (region && region !== 'All') filter.region = region;
    if (domain && domain !== 'All') filter.scienceDomain = domain;
    if (year && year !== 'All') filter.year = Number(year);

    const publications = await Publication.find(filter).sort({ year: -1 }).lean();
    res.json({ success: true, count: publications.length, data: publications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single publication by ID with connected research project
// @route   GET /api/publications/:id
// @access  Public
const getPublicationById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const pub = await Publication.findOne({
      $or: [{ publicationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!pub) {
      return res.status(404).json({ success: false, message: `Publication '${id}' not found.` });
    }

    let affiliatedProject = null;
    if (pub.projectId) {
      affiliatedProject = await ResearchProject.findOne({ projectId: pub.projectId }).lean();
    }

    res.json({
      success: true,
      data: {
        ...pub,
        affiliatedProject
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublications,
  getPublicationById
};
