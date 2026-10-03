const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Publication = require('../models/Publication');
const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Activity = require('../models/Activity');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../uploads/research');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

// Allowed file types for research documents
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.nc', '.nc4', '.csv', '.zip', '.gz', '.xlsx', '.txt', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Supported types: PDF, Word, NetCDF, CSV, Zip, Excel.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter
});

// @desc    Handle file upload for research documents
// @route   POST /api/research/upload-file
// @access  Researcher, Admin
const handleFileUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a research file to upload.' });
    }

    const fileUrl = `/uploads/research/${req.file.filename}`;
    const fileSizeMb = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

    res.json({
      success: true,
      message: 'Research file uploaded successfully',
      data: {
        fileUrl,
        fileName: req.file.originalname,
        fileSize: fileSizeMb,
        mimetype: req.file.mimetype
      }
    });
  });
};

// @desc    Submit a new Research Publication (Peer-reviewed paper/manuscript)
// @route   POST /api/research/publication
// @access  Researcher, Admin
const uploadPublication = async (req, res, next) => {
  try {
    const {
      title,
      authors,
      journal,
      year,
      volume,
      issue,
      pages,
      doi,
      abstract,
      region,
      scienceDomain,
      stationId,
      stationName,
      projectId,
      sourceUrl,
      fileUrl,
      fileName,
      fileSize
    } = req.body;

    if (!title || !abstract || !journal || !year || !region || !scienceDomain) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, authors, journal, year, region, science domain, and abstract.'
      });
    }

    // Process authors into array if comma-separated
    let authorList = [];
    if (Array.isArray(authors)) {
      authorList = authors;
    } else if (typeof authors === 'string') {
      authorList = authors.split(',').map(a => a.trim()).filter(Boolean);
    }
    if (authorList.length === 0) {
      authorList = [req.user?.name || 'Dr. Researcher (NCPOR)'];
    }

    // Generate unique publication ID
    const yearVal = Number(year) || new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const publicationId = req.body.publicationId || `PUB-${yearVal}-${randomSuffix}`;

    const newPublication = await Publication.create({
      publicationId,
      title: title.trim(),
      authors: authorList,
      journal: journal.trim(),
      year: yearVal,
      volume: volume || '',
      issue: issue || '',
      pages: pages || '',
      doi: doi ? doi.trim() : `10.1016/j.polaris.${yearVal}.${randomSuffix}`,
      abstract: abstract.trim(),
      region,
      scienceDomain,
      stationId: stationId ? stationId.toLowerCase() : '',
      stationName: stationName || '',
      projectId: projectId || '',
      sourceUrl: sourceUrl || fileUrl || 'https://npdc.ncpor.res.in',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || '',
      uploadedBy: req.user?._id || null,
      uploadedByName: req.user?.name || 'Polar Researcher',
      verificationStatus: 'researcher-verified'
    });

    // Record system activity
    await Activity.create({
      action: 'Uploaded Research Publication',
      actorName: req.user ? req.user.name : 'Polar Researcher',
      actorRole: req.user ? req.user.role : 'researcher',
      targetType: 'Publication',
      targetId: newPublication._id.toString(),
      targetTitle: newPublication.title,
      details: `Published in ${newPublication.journal} (${newPublication.year}) under ${newPublication.region} [${newPublication.scienceDomain}]`
    }).catch(e => console.warn('Activity log failed:', e.message));

    res.status(201).json({
      success: true,
      message: 'Research publication registered successfully in VYOM knowledge repository',
      data: newPublication
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a new Polar Research Project / Campaign
// @route   POST /api/research/project
// @access  Researcher, Admin
const uploadProject = async (req, res, next) => {
  try {
    const {
      title,
      shortDescription,
      description,
      region,
      scienceDomain,
      year,
      duration,
      stationId,
      stationName,
      expeditionId,
      expeditionName,
      leadResearcher,
      collaboratingInstitutes,
      methodology,
      keyFindings,
      keywords,
      studentExplanation,
      sourceUrl,
      fileUrl,
      fileName
    } = req.body;

    if (!title || !shortDescription || !region || !scienceDomain || !stationId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, short description, region, science domain, and station.'
      });
    }

    const yearVal = Number(year) || new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const projectId = req.body.projectId || `POL-PRJ-${yearVal}-${randomSuffix}`;

    const newProject = await ResearchProject.create({
      projectId,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: (description || shortDescription).trim(),
      region,
      scienceDomain,
      year: yearVal,
      duration: duration || `${yearVal} - ${yearVal + 2}`,
      stationId: stationId.toLowerCase(),
      stationName: stationName || stationId.charAt(0).toUpperCase() + stationId.slice(1),
      expeditionId: expeditionId || 'isea-current',
      expeditionName: expeditionName || `Polar Campaign ${yearVal}`,
      leadResearcher: {
        name: leadResearcher?.name || req.user?.name || 'Dr. Researcher',
        designation: leadResearcher?.designation || 'Principal Investigator',
        institute: leadResearcher?.institute || req.user?.institution || 'National Centre for Polar and Ocean Research (NCPOR)',
        email: leadResearcher?.email || req.user?.email || 'researcher@polaris.demo',
        orcid: leadResearcher?.orcid || ''
      },
      collaboratingInstitutes: Array.isArray(collaboratingInstitutes) ? collaboratingInstitutes : ['NCPOR', 'MoES'],
      methodology: methodology || 'In-situ sensor telemetry, ice-core extraction, and satellite validation.',
      keyFindings: Array.isArray(keyFindings) ? keyFindings : (keyFindings ? [keyFindings] : ['Baseline observations collected and validated against NPDC standards.']),
      keywords: Array.isArray(keywords) ? keywords : ['polar-research', region.toLowerCase(), scienceDomain.toLowerCase()],
      studentExplanation: studentExplanation || {
        summary: shortDescription,
        whyItMatters: 'Helps scientists understand global climate feedback mechanisms originating at the Earth poles.',
        keyConcepts: [scienceDomain, region, 'Climate teleconnections'],
        funFact: 'Data recorded here feeds into international polar observation models worldwide!'
      },
      sourceUrl: sourceUrl || fileUrl || 'https://npdc.ncpor.res.in',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      uploadedBy: req.user?._id || null,
      uploadedByName: req.user?.name || 'Polar Researcher',
      verificationStatus: 'official-source-verified'
    });

    await Activity.create({
      action: 'Registered Polar Research Project',
      actorName: req.user ? req.user.name : 'Polar Researcher',
      actorRole: req.user ? req.user.role : 'researcher',
      targetType: 'ResearchProject',
      targetId: newProject._id.toString(),
      targetTitle: newProject.title,
      details: `Project ${newProject.projectId} hosted at ${newProject.stationName} (${newProject.region})`
    }).catch(e => console.warn('Activity log failed:', e.message));

    res.status(201).json({
      success: true,
      message: 'Polar Research Project registered successfully',
      data: newProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an in-situ observational dataset
// @route   POST /api/research/dataset
// @access  Researcher, Admin
const uploadDataset = async (req, res, next) => {
  try {
    const {
      title,
      description,
      region,
      scienceDomain,
      stationId,
      stationName,
      expeditionId,
      expeditionName,
      projectId,
      year,
      temporalCoverage,
      spatialCoverage,
      parameters,
      format,
      fileSize,
      accessType,
      sourceUrl,
      fileUrl,
      fileName,
      citation
    } = req.body;

    if (!title || !description || !region || !scienceDomain) {
      return res.status(400).json({
        success: false,
        message: 'Please provide dataset title, description, region, and science domain.'
      });
    }

    const yearVal = Number(year) || new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const datasetId = req.body.datasetId || `NPDC-DS-${yearVal}-${randomSuffix}`;

    const newDataset = await Dataset.create({
      datasetId,
      title: title.trim(),
      description: description.trim(),
      region,
      scienceDomain,
      stationId: stationId ? stationId.toLowerCase() : 'maitri',
      stationName: stationName || 'Maitri',
      expeditionId: expeditionId || 'isea-current',
      expeditionName: expeditionName || `Expedition ${yearVal}`,
      projectId: projectId || '',
      year: yearVal,
      temporalCoverage: temporalCoverage || { start: `${yearVal}-01-01`, end: `${yearVal}-12-31` },
      spatialCoverage: spatialCoverage || { latMin: -70.77, latMax: -70.76, lngMin: 11.73, lngMax: 11.75 },
      parameters: Array.isArray(parameters) ? parameters : ['Temperature', 'Radiation', 'Humidity'],
      format: format || 'NetCDF / CSV',
      fileSize: fileSize || '24.5 MB',
      provider: `NPDC / ${req.user?.institution || 'NCPOR'}`,
      accessType: accessType || 'Open Access',
      sourceUrl: sourceUrl || fileUrl || 'https://npdc.ncpor.res.in',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      uploadedBy: req.user?._id || null,
      uploadedByName: req.user?.name || 'Polar Researcher',
      verificationStatus: 'official-source-verified',
      citation: citation || `${req.user?.name || 'Researcher'} (${yearVal}). In-situ Polar Observations. NPDC Repository.`
    });

    await Activity.create({
      action: 'Uploaded NPDC Dataset',
      actorName: req.user ? req.user.name : 'Polar Researcher',
      actorRole: req.user ? req.user.role : 'researcher',
      targetType: 'Dataset',
      targetId: newDataset._id.toString(),
      targetTitle: newDataset.title,
      details: `${newDataset.format} dataset (${newDataset.fileSize}) for ${newDataset.stationName}`
    }).catch(e => console.warn('Activity log failed:', e.message));

    res.status(201).json({
      success: true,
      message: 'Dataset submitted successfully to NPDC repository',
      data: newDataset
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get researcher's own uploaded research submissions
// @route   GET /api/research/my-submissions
// @access  Researcher, Admin
const getMySubmissions = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const userName = req.user?.name;

    // Look for items uploaded by user ID or author name
    const query = {
      $or: [
        { uploadedBy: userId },
        { uploadedByName: userName }
      ]
    };

    const [userPubs, userProjects, userDatasets] = await Promise.all([
      Publication.find(query).sort({ createdAt: -1 }).lean(),
      ResearchProject.find(query).sort({ createdAt: -1 }).lean(),
      Dataset.find(query).sort({ createdAt: -1 }).lean()
    ]);

    // Fallback: If user has not uploaded any yet, provide recent publications/projects so the view is informative
    let publications = userPubs;
    let projects = userProjects;
    let datasets = userDatasets;

    if (publications.length === 0 && projects.length === 0 && datasets.length === 0) {
      publications = await Publication.find().sort({ createdAt: -1, year: -1 }).limit(3).lean();
      projects = await ResearchProject.find().sort({ createdAt: -1, year: -1 }).limit(2).lean();
      datasets = await Dataset.find().sort({ createdAt: -1, year: -1 }).limit(2).lean();
    }

    res.json({
      success: true,
      data: {
        publications,
        projects,
        datasets,
        summary: {
          totalPublications: publications.length,
          totalProjects: projects.length,
          totalDatasets: datasets.length,
          totalSubmissions: publications.length + projects.length + datasets.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleFileUpload,
  uploadPublication,
  uploadProject,
  uploadDataset,
  getMySubmissions
};
