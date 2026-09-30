const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const Station = require('../models/Station');
const Expedition = require('../models/Expedition');

// @desc    Get all research projects with filtering
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res, next) => {
  try {
    const { region, domain, station, year } = req.query;
    const filter = {};

    if (region && region !== 'All') filter.region = new RegExp(`^${region}$`, 'i');
    if (domain && domain !== 'All') filter.scienceDomain = new RegExp(`^${domain}$`, 'i');
    if (station && station !== 'All') filter.stationId = station.toLowerCase();
    if (year && year !== 'All') filter.year = Number(year);

    const projects = await ResearchProject.find(filter).sort({ year: -1 }).lean();
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single research project with its complete interconnected knowledge graph
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const project = await ResearchProject.findOne({
      $or: [{ projectId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!project) {
      return res.status(404).json({ success: false, message: `Research Project '${id}' not found.` });
    }

    // Connect the full knowledge network
    const [station, expedition, datasets, reports, publications, media] = await Promise.all([
      Station.findOne({ stationId: project.stationId }).lean(),
      Expedition.findOne({ expeditionId: project.expeditionId }).lean(),
      Dataset.find({ projectId: project.projectId }).lean(),
      Report.find({ projectId: project.projectId }).lean(),
      Publication.find({ projectId: project.projectId }).lean(),
      Media.find({ $or: [{ projectId: project.projectId }, { stationId: project.stationId }] }).limit(6).lean()
    ]);

    // Knowledge relationship graph nodes and links summary
    const knowledgeGraph = {
      nodes: [
        { id: project.projectId, label: project.title, type: 'Project', category: project.scienceDomain },
        { id: project.stationId, label: project.stationName, type: 'Station', category: project.region },
        { id: project.expeditionId, label: project.expeditionName, type: 'Expedition', category: 'Mission' },
        { id: project.leadResearcher?.name, label: project.leadResearcher?.name, type: 'Researcher', category: 'Investigator' },
        ...datasets.map(d => ({ id: d.datasetId, label: d.title, type: 'Dataset', category: d.format })),
        ...reports.map(r => ({ id: r.reportId, label: r.title, type: 'Report', category: r.reportType })),
        ...publications.map(p => ({ id: p.publicationId, label: p.title, type: 'Publication', category: p.journal }))
      ],
      connections: [
        { source: project.projectId, target: project.stationId, relation: 'Hosted At' },
        { source: project.projectId, target: project.expeditionId, relation: 'Executed Under' },
        { source: project.projectId, target: project.leadResearcher?.name, relation: 'Led By' },
        ...datasets.map(d => ({ source: project.projectId, target: d.datasetId, relation: 'Produces Dataset' })),
        ...reports.map(r => ({ source: project.projectId, target: r.reportId, relation: 'Documented In' })),
        ...publications.map(p => ({ source: project.projectId, target: p.publicationId, relation: 'Published In' }))
      ]
    };

    res.json({
      success: true,
      data: {
        ...project,
        station,
        expedition,
        datasets,
        reports,
        publications,
        media,
        knowledgeGraph
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new research project (researcher or admin)
// @route   POST /api/projects
// @access  Researcher, Admin
const createProject = async (req, res, next) => {
  try {
    const project = await ResearchProject.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update research project (researcher or admin)
// @route   PATCH /api/projects/:id
// @access  Researcher, Admin
const updateProject = async (req, res, next) => {
  try {
    const project = await ResearchProject.findOneAndUpdate(
      { projectId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Research project not found.' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject
};
