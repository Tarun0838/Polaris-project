const Report = require('../models/Report');
const ResearchProject = require('../models/ResearchProject');

// @desc    Get all reports with filters
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res, next) => {
  try {
    const { region, reportType, year, station } = req.query;
    const filter = {};

    if (region && region !== 'All') filter.region = region;
    if (reportType && reportType !== 'All') filter.reportType = reportType;
    if (year && year !== 'All') filter.year = Number(year);
    if (station && station !== 'All') filter.stationId = station.toLowerCase();

    const reports = await Report.find(filter).sort({ year: -1 }).lean();
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report by ID with affiliated project
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const report = await Report.findOne({
      $or: [{ reportId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!report) {
      return res.status(404).json({ success: false, message: `Report '${id}' not found.` });
    }

    let affiliatedProject = null;
    if (report.projectId) {
      affiliatedProject = await ResearchProject.findOne({ projectId: report.projectId }).lean();
    }

    res.json({
      success: true,
      data: {
        ...report,
        affiliatedProject
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  getReportById
};
