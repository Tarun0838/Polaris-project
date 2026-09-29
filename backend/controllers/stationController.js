const Station = require('../models/Station');
const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Publication = require('../models/Publication');
const Expedition = require('../models/Expedition');
const Media = require('../models/Media');

// @desc    Get all stations with summary counts
// @route   GET /api/stations
// @access  Public
const getStations = async (req, res, next) => {
  try {
    const stations = await Station.find().sort({ establishedYear: 1 }).lean();

    const enrichedStations = await Promise.all(
      stations.map(async (st) => {
        const [researchCount, datasetCount, reportCount, pubCount, expCount] = await Promise.all([
          ResearchProject.countDocuments({ stationId: st.stationId }),
          Dataset.countDocuments({ stationId: st.stationId }),
          Report.countDocuments({ stationId: st.stationId }),
          Publication.countDocuments({ stationId: st.stationId }),
          Expedition.countDocuments({ stations: st.name })
        ]);

        return {
          ...st,
          stats: {
            researchCount,
            datasetCount,
            reportCount,
            pubCount,
            expCount
          }
        };
      })
    );

    res.json({ success: true, count: enrichedStations.length, data: enrichedStations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single station with connected resources
// @route   GET /api/stations/:id
// @access  Public
const getStationById = async (req, res, next) => {
  try {
    const id = req.params.id.toLowerCase();
    const station = await Station.findOne({
      $or: [{ stationId: id }, { name: new RegExp(`^${id}$`, 'i') }]
    }).lean();

    if (!station) {
      return res.status(404).json({ success: false, message: `Station '${id}' not found.` });
    }

    const [projects, datasets, reports, publications, expeditions, media] = await Promise.all([
      ResearchProject.find({ stationId: station.stationId }).limit(10).lean(),
      Dataset.find({ stationId: station.stationId }).limit(10).lean(),
      Report.find({ stationId: station.stationId }).limit(10).lean(),
      Publication.find({ stationId: station.stationId }).limit(10).lean(),
      Expedition.find({ stations: station.name }).limit(10).lean(),
      Media.find({ stationId: station.stationId }).limit(12).lean()
    ]);

    const stats = {
      researchCount: await ResearchProject.countDocuments({ stationId: station.stationId }),
      datasetCount: await Dataset.countDocuments({ stationId: station.stationId }),
      reportCount: await Report.countDocuments({ stationId: station.stationId }),
      pubCount: await Publication.countDocuments({ stationId: station.stationId }),
      expCount: await Expedition.countDocuments({ stations: station.name })
    };

    res.json({
      success: true,
      data: {
        ...station,
        stats,
        related: {
          projects,
          datasets,
          reports,
          publications,
          expeditions,
          media
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new station (admin only)
// @route   POST /api/stations
// @access  Admin
const createStation = async (req, res, next) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

// @desc    Update station (admin only)
// @route   PATCH /api/stations/:id
// @access  Admin
const updateStation = async (req, res, next) => {
  try {
    const station = await Station.findOneAndUpdate(
      { stationId: req.params.id.toLowerCase() },
      req.body,
      { new: true, runValidators: true }
    );
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found.' });
    }
    res.json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStations,
  getStationById,
  createStation,
  updateStation
};
