const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Publication = require('../models/Publication');
const Expedition = require('../models/Expedition');
const Station = require('../models/Station');
const GeneratedContent = require('../models/GeneratedContent');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Get comprehensive admin overview metrics & chart distributions
// @route   GET /api/admin/stats
// @access  Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalProjects,
      totalDatasets,
      totalReports,
      totalPublications,
      totalExpeditions,
      totalStations,
      totalUsers,
      pendingAiReviews,
      publishedContent,
      totalDrafts,
      recentActivities
    ] = await Promise.all([
      ResearchProject.countDocuments(),
      Dataset.countDocuments(),
      Report.countDocuments(),
      Publication.countDocuments(),
      Expedition.countDocuments(),
      Station.countDocuments(),
      User.countDocuments(),
      GeneratedContent.countDocuments({ status: 'in_review' }),
      GeneratedContent.countDocuments({ status: 'published' }),
      GeneratedContent.countDocuments({ status: 'draft' }),
      Activity.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const totalResources = totalProjects + totalDatasets + totalReports + totalPublications;

    // Distribution by Type
    const resourcesByType = [
      { name: 'Research Projects', count: totalProjects, color: '#1E3E62' },
      { name: 'Datasets (NPDC)', count: totalDatasets, color: '#0EA5E9' },
      { name: 'Reports', count: totalReports, color: '#38BDF8' },
      { name: 'Publications', count: totalPublications, color: '#0284C7' }
    ];

    // Distribution by Region
    const [antarcticaCount, arcticCount, himalayaCount, southernOceanCount] = await Promise.all([
      ResearchProject.countDocuments({ region: 'Antarctica' }),
      ResearchProject.countDocuments({ region: 'Arctic' }),
      ResearchProject.countDocuments({ region: 'Himalaya' }),
      ResearchProject.countDocuments({ region: 'Southern Ocean' })
    ]);

    const resourcesByRegion = [
      { name: 'Antarctica', value: antarcticaCount, color: '#0284C7' },
      { name: 'Arctic', value: arcticCount, color: '#38BDF8' },
      { name: 'Himalaya', value: himalayaCount, color: '#0EA5E9' },
      { name: 'Southern Ocean', value: southernOceanCount, color: '#64748B' }
    ];

    // Distribution by Science Domain
    const domainAgg = await ResearchProject.aggregate([
      { $group: { _id: '$scienceDomain', count: { $sum: 1 } } }
    ]);
    const researchByDomain = domainAgg.map(d => ({ name: d._id || 'General', count: d.count }));

    // Content Publishing Status
    const [draftCount, reviewCount, approvedCount, pubCount, rejectedCount] = await Promise.all([
      GeneratedContent.countDocuments({ status: 'draft' }),
      GeneratedContent.countDocuments({ status: 'in_review' }),
      GeneratedContent.countDocuments({ status: 'approved' }),
      GeneratedContent.countDocuments({ status: 'published' }),
      GeneratedContent.countDocuments({ status: 'rejected' })
    ]);

    const publishingStatus = [
      { status: 'Drafts', count: draftCount },
      { status: 'In Review', count: reviewCount },
      { status: 'Approved', count: approvedCount },
      { status: 'Published', count: pubCount },
      { status: 'Rejected', count: rejectedCount }
    ];

    res.json({
      success: true,
      data: {
        counts: {
          totalResources,
          totalProjects,
          totalDatasets,
          totalReports,
          totalPublications,
          totalExpeditions,
          totalStations,
          totalUsers,
          pendingAiReviews,
          publishedContent,
          totalDrafts
        },
        charts: {
          resourcesByType,
          resourcesByRegion,
          researchByDomain,
          publishingStatus
        },
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a generic verified resource
// @route   POST /api/admin/resources
// @access  Admin
const addResource = async (req, res, next) => {
  try {
    const { resourceType, data } = req.body;

    let createdRecord;
    if (resourceType === 'ResearchProject') {
      createdRecord = await ResearchProject.create(data);
    } else if (resourceType === 'Dataset') {
      createdRecord = await Dataset.create(data);
    } else if (resourceType === 'Report') {
      createdRecord = await Report.create(data);
    } else if (resourceType === 'Publication') {
      createdRecord = await Publication.create(data);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid resource type specified.' });
    }

    await Activity.create({
      action: 'Created Resource Record',
      actorName: req.user ? req.user.name : 'System Administrator',
      actorRole: 'admin',
      targetType: resourceType,
      targetId: createdRecord._id.toString(),
      targetTitle: createdRecord.title || createdRecord.name,
      details: `Added new ${resourceType} to official POLARIS repository`
    });

    res.status(201).json({ success: true, data: createdRecord });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  addResource
};
