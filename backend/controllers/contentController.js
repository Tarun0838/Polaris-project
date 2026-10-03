const GeneratedContent = require('../models/GeneratedContent');
const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const Station = require('../models/Station');
const Activity = require('../models/Activity');
const { generateOutreachContent } = require('../services/aiService');

// @desc    Generate new AI draft grounded strictly in verified research metadata
// @route   POST /api/content/generate
// @access  Public or Protected
const generateDraft = async (req, res, next) => {
  try {
    const { projectId, audience, contentType, imageUrl, imageCaption, imageCredit } = req.body;

    if (!projectId || !audience || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, audience, and contentType.'
      });
    }

    // 1. Fetch verified research metadata
    const project = await ResearchProject.findOne({
      $or: [{ projectId }, { _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Verified Research Project '${projectId}' not found in VYOM repository.`
      });
    }

    // 2. Fetch connected datasets, reports, publications
    const [relatedDatasets, relatedReports, relatedPublications] = await Promise.all([
      Dataset.find({ projectId: project.projectId }).limit(3).lean(),
      Report.find({ projectId: project.projectId }).limit(3).lean(),
      Publication.find({ projectId: project.projectId }).limit(3).lean()
    ]);

    // 3. Assemble verified source references
    const sourceReferences = [
      {
        title: `${project.title} (${project.stationName}, ${project.region})`,
        type: 'Official Research Record',
        url: project.sourceUrl,
        identifier: project.projectId
      },
      ...relatedDatasets.map(d => ({
        title: d.title,
        type: 'NPDC In-Situ Dataset',
        url: d.sourceUrl,
        identifier: d.datasetId
      })),
      ...relatedReports.map(r => ({
        title: r.title,
        type: r.reportType,
        url: r.sourceUrl,
        identifier: r.reportId
      })),
      ...relatedPublications.map(p => ({
        title: p.title,
        type: 'Peer-Reviewed Paper (DOI)',
        url: p.sourceUrl,
        identifier: p.doi
      }))
    ];

    const sourceIds = [
      project.projectId,
      ...relatedDatasets.map(d => d.datasetId),
      ...relatedReports.map(r => r.reportId),
      ...relatedPublications.map(p => p.publicationId)
    ];

    // 4. Resolve authentic photo for this outreach draft
    let photoUrl = imageUrl || '';
    let photoCaption = imageCaption || '';
    let photoCredit = imageCredit || '';

    if (!photoUrl) {
      // 4a. Check direct project media
      let matchedMedia = await Media.findOne({ projectId: project.projectId, type: 'image' }).lean();
      
      // 4b. Check station media
      if (!matchedMedia && project.stationId) {
        matchedMedia = await Media.findOne({ stationId: project.stationId, type: 'image' }).lean();
      }
      if (!matchedMedia && project.stationName) {
        matchedMedia = await Media.findOne({
          stationName: new RegExp(project.stationName, 'i'),
          type: 'image'
        }).lean();
      }

      // 4c. Check station hero image
      if (!matchedMedia && project.stationId) {
        const stationDoc = await Station.findOne({ stationId: project.stationId }).lean();
        if (stationDoc && stationDoc.heroImage) {
          photoUrl = stationDoc.heroImage;
          photoCaption = `${stationDoc.name} Research Station, ${stationDoc.location}`;
          photoCredit = 'MoES / NCPOR Archive';
        }
      }

      if (!photoUrl && matchedMedia) {
        photoUrl = matchedMedia.url;
        photoCaption = matchedMedia.caption || matchedMedia.title;
        photoCredit = matchedMedia.credit || 'NCPOR Photographic Cell';
      }

      // 4d. Fallback to region media
      if (!photoUrl && project.region) {
        const regionMedia = await Media.findOne({ region: project.region, type: 'image' }).lean();
        if (regionMedia) {
          photoUrl = regionMedia.url;
          photoCaption = regionMedia.caption || regionMedia.title;
          photoCredit = regionMedia.credit || 'MoES / NCPOR Archive';
        }
      }
    }

    if (!photoUrl) {
      photoUrl = '/stations/bharati.jpg';
      photoCaption = `${project.stationName || 'Polar'} Research Operations`;
      photoCredit = 'MoES / NCPOR Photographic Documentation Wing';
    }

    // 5. Grounded AI Generation
    const aiResult = await generateOutreachContent({
      project,
      relatedDatasets,
      relatedReports,
      relatedPublications,
      audience,
      contentType
    });

    // 6. Store generated draft with status = 'draft' including photo metadata
    const generatedDraft = await GeneratedContent.create({
      title: aiResult.title,
      content: aiResult.content,
      keyFacts: aiResult.keyFacts,
      contentType,
      audience,
      projectId: project.projectId,
      projectTitle: project.title,
      imageUrl: photoUrl,
      imageCaption: photoCaption,
      imageCredit: photoCredit,
      sourceIds,
      sourceReferences,
      generatedBy: req.user ? req.user._id : null,
      authorName: req.user ? req.user.name : 'VYOM Intelligence Engine',
      status: 'draft',
      isCuratorVerified: false
    });

    // Log activity
    await Activity.create({
      action: 'Generated Outreach Draft',
      actorName: req.user ? req.user.name : 'Outreach Contributor',
      actorRole: req.user ? req.user.role : 'contributor',
      targetType: 'Content',
      targetId: generatedDraft._id.toString(),
      targetTitle: generatedDraft.title,
      details: `Generated ${contentType} for ${audience} grounded in project ${project.projectId}`
    });

    res.status(201).json({
      success: true,
      message: 'Draft successfully generated from verified sources with attached authentic media.',
      isAiLive: aiResult.isAiLive,
      data: generatedDraft
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all generated content with optional status filter
// @route   GET /api/content
// @access  Public
const getContentList = async (req, res, next) => {
  try {
    const { status, audience, contentType } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (audience && audience !== 'All') filter.audience = audience;
    if (contentType && contentType !== 'All') filter.contentType = contentType;

    const items = await GeneratedContent.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single generated content item by ID
// @route   GET /api/content/:id
// @access  Public
const getContentById = async (req, res, next) => {
  try {
    const item = await GeneratedContent.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content record not found.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update draft content (author or admin)
// @route   PUT /api/content/:id
// @access  Protected
const updateContent = async (req, res, next) => {
  try {
    const { title, content, keyFacts, status } = req.body;
    const item = await GeneratedContent.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Content record not found.' });
    }

    if (title) item.title = title;
    if (content) item.content = content;
    if (keyFacts) item.keyFacts = keyFacts;
    if (req.body.imageUrl !== undefined) item.imageUrl = req.body.imageUrl;
    if (req.body.imageCaption !== undefined) item.imageCaption = req.body.imageCaption;
    if (req.body.imageCredit !== undefined) item.imageCredit = req.body.imageCredit;
    if (status && ['draft', 'in_review'].includes(status)) item.status = status;

    await item.save();

    res.json({ success: true, message: 'Draft updated successfully.', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit draft for curator review
// @route   PATCH /api/content/:id/submit-review
// @access  Protected/Public
const submitForReview = async (req, res, next) => {
  try {
    const item = await GeneratedContent.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content record not found.' });
    }

    item.status = 'in_review';
    await item.save();

    await Activity.create({
      action: 'Submitted for Curator Review',
      actorName: req.user ? req.user.name : item.authorName || 'Outreach Specialist',
      actorRole: req.user ? req.user.role : 'contributor',
      targetType: 'Content',
      targetId: item._id.toString(),
      targetTitle: item.title,
      details: 'Pending human verification by Polar Science Curator'
    });

    res.json({
      success: true,
      message: 'Draft submitted to curator review queue.',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Curator review (Approve or Reject with feedback)
// @route   PATCH /api/content/:id/review
// @access  Admin/Curator
const reviewContent = async (req, res, next) => {
  try {
    const { decision, reviewComment } = req.body; // decision: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'approved' or 'rejected'." });
    }

    const item = await GeneratedContent.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content record not found.' });
    }

    item.status = decision;
    item.reviewer = req.user ? req.user._id : null;
    item.reviewerName = req.user ? req.user.name : 'Senior Science Curator';
    item.reviewComment = reviewComment || (decision === 'approved' ? 'Verified against official NCPOR scientific record.' : 'Scientific revision required.');
    item.isCuratorVerified = decision === 'approved';

    await item.save();

    await Activity.create({
      action: decision === 'approved' ? 'Curator Approved Content' : 'Curator Rejected Content',
      actorName: item.reviewerName,
      actorRole: 'admin',
      targetType: 'Content',
      targetId: item._id.toString(),
      targetTitle: item.title,
      details: item.reviewComment
    });

    res.json({
      success: true,
      message: `Content successfully ${decision}.`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish approved content to public portal
// @route   PATCH /api/content/:id/publish
// @access  Admin
const publishContent = async (req, res, next) => {
  try {
    const item = await GeneratedContent.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content record not found.' });
    }

    item.status = 'published';
    item.isCuratorVerified = true;
    item.publishedAt = new Date();
    await item.save();

    await Activity.create({
      action: 'Published Outreach Content',
      actorName: req.user ? req.user.name : 'MoES Editorial Admin',
      actorRole: 'admin',
      targetType: 'Content',
      targetId: item._id.toString(),
      targetTitle: item.title,
      details: 'Live on VYOM Public Outreach Dissemination Portal'
    });

    res.json({
      success: true,
      message: 'Content is now published and accessible on public outreach channels.',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDraft,
  getContentList,
  getContentById,
  updateContent,
  submitForReview,
  reviewContent,
  publishContent
};
