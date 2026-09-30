const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load models
const User = require('../models/User');
const Station = require('../models/Station');
const Expedition = require('../models/Expedition');
const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const EducationalContent = require('../models/EducationalContent');
const GeneratedContent = require('../models/GeneratedContent');
const Activity = require('../models/Activity');
const PolarAsset = require('../models/PolarAsset');

const seedData = async (shouldExit = true) => {
  try {
    console.log('[POLARIS-SEED] Starting database initialization...');

    // Load JSON seed files
    const stations = JSON.parse(fs.readFileSync(path.join(__dirname, 'stations.json'), 'utf-8'));
    const expeditions = JSON.parse(fs.readFileSync(path.join(__dirname, 'expeditions.json'), 'utf-8'));
    const researchProjects = JSON.parse(fs.readFileSync(path.join(__dirname, 'researchProjects.json'), 'utf-8'));
    const datasets = JSON.parse(fs.readFileSync(path.join(__dirname, 'datasets.json'), 'utf-8'));
    const reports = JSON.parse(fs.readFileSync(path.join(__dirname, 'reports.json'), 'utf-8'));
    const publications = JSON.parse(fs.readFileSync(path.join(__dirname, 'publications.json'), 'utf-8'));
    const media = JSON.parse(fs.readFileSync(path.join(__dirname, 'media.json'), 'utf-8'));
    const educationalContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'educationalContent.json'), 'utf-8'));
    const polarAssets = JSON.parse(fs.readFileSync(path.join(__dirname, 'polarAssets.json'), 'utf-8'));

    // Clear existing collections
    console.log('[POLARIS-SEED] Purging previous records...');
    await Promise.all([
      User.deleteMany({}),
      Station.deleteMany({}),
      Expedition.deleteMany({}),
      ResearchProject.deleteMany({}),
      Dataset.deleteMany({}),
      Report.deleteMany({}),
      Publication.deleteMany({}),
      Media.deleteMany({}),
      EducationalContent.deleteMany({}),
      GeneratedContent.deleteMany({}),
      Activity.deleteMany({}),
      PolarAsset.deleteMany({})
    ]);

    // 1. Seed Users (Admin, Researcher, Student)
    console.log('[POLARIS-SEED] Creating verified demo accounts...');
    const adminUser = await User.create({
      name: 'Dr. M. Ravichandran',
      email: 'admin@polaris.demo',
      password: 'polaris123',
      role: 'admin',
      institution: 'Ministry of Earth Sciences (MoES), New Delhi'
    });

    const researcherUser = await User.create({
      name: 'Dr. Rohit Srivastava',
      email: 'researcher@polaris.demo',
      password: 'polaris123',
      role: 'researcher',
      institution: 'National Centre for Polar and Ocean Research (NCPOR), Goa'
    });

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@polaris.demo',
      password: 'polaris123',
      role: 'student',
      institution: 'Indian Institute of Technology (IIT) Delhi'
    });

    // 2. Seed Core Polar Collections
    console.log('[POLARIS-SEED] Seeding Stations, Expeditions & Projects...');
    await Station.insertMany(stations);
    await Expedition.insertMany(expeditions);
    await ResearchProject.insertMany(researchProjects);
    await Dataset.insertMany(datasets);
    await Report.insertMany(reports);
    await Publication.insertMany(publications);
    await Media.insertMany(media);
    await EducationalContent.insertMany(educationalContent);
    await PolarAsset.insertMany(polarAssets);

    // 3. Seed AI Content Engine samples across the workflow
    console.log('[POLARIS-SEED] Seeding AI Outreach drafts & human curation records...');
    await GeneratedContent.create([
      {
        title: 'Deep Freeze Sentinels: How Maitri Station Decodes Antarctica’s Permafrost',
        content: `### Ground Zero for Antarctic Climate Science\nOperating at India's inland polar hub **Maitri Station** in the Schirmacher Oasis, researchers are investigating the subtle yet critical thawing of permafrost active layers.\n\n* **Active Layer Dynamics:** Borehole thermistors reveal that the summer thaw depth has increased by 4.2 cm across five years.\n* **Supra-Permafrost Melt:** Unchecked surface warming could alter the freshwater mineral balance of Lake Priyadarshini.\n* **Global Implications:** Permafrost acts as a thermal buffer; measuring its degradation provides early warnings for polar ice destabilization.\n\n> *Data verified against official NPDC in-situ records under Project POL-PRJ-2023-01.*`,
        keyFacts: [
          'Active layer thaw depth increased by 4.2 cm over 5 years.',
          'Maitri Station is built on an ice-free rocky oasis in Queen Maud Land.',
          'Boreholes down to 5 meters record soil thermal regimes 24/7.'
        ],
        contentType: 'Website Article',
        audience: 'College Student',
        projectId: 'POL-PRJ-2023-01',
        projectTitle: researchProjects[0].title,
        sourceIds: ['POL-PRJ-2023-01', 'NPDC-DS-2023-ANT-01', 'NCPOR-TR-2024-01'],
        sourceReferences: [
          {
            title: researchProjects[0].title,
            type: 'Official Research Record',
            url: researchProjects[0].sourceUrl,
            identifier: 'POL-PRJ-2023-01'
          },
          {
            title: 'Hourly Permafrost Borehole Temperature Profiles',
            type: 'NPDC In-Situ Dataset',
            url: 'https://data.ncpor.res.in/graph',
            identifier: 'NPDC-DS-2023-ANT-01'
          }
        ],
        generatedBy: researcherUser._id,
        authorName: researcherUser.name,
        status: 'published',
        reviewer: adminUser._id,
        reviewerName: adminUser.name,
        reviewComment: 'Verified against official NCPOR cryosphere field data. Approved for public dissemination.',
        isCuratorVerified: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'IndARC in the Arctic: Decoding the Secret Link Between Ny-Ålesund and the Indian Monsoon',
        content: `### An Underwater Robot 192 Meters Beneath Arctic Ice\nDuring the 14th Indian Arctic Expedition at Himadri Station, India's **IndARC** mooring captured unprecedented warm Atlantic water pulses entering Kongsfjorden.\n\n* **The Discovery:** Winter heat surges in the Arctic ocean correlate with anomalous wavy patterns in the jet stream.\n* **The Impact on India:** These high-altitude atmospheric waves create a 14-day teleconnection phase lag with monsoon rain distribution across central India.\n* **Continuous Monitoring:** IndARC provides unbroken year-round observations even in the darkest polar winter months.`,
        keyFacts: [
          'IndARC is moored 192 meters deep in Kongsfjorden, Svalbard.',
          'Records ocean currents, temperature, salinity, and marine acoustic signals.',
          'Demonstrates direct climate linkages between Arctic warming and Indian rainfall.'
        ],
        contentType: 'Educational Summary',
        audience: 'General Public',
        projectId: 'POL-PRJ-2023-03',
        projectTitle: researchProjects[2].title,
        sourceIds: ['POL-PRJ-2023-03', 'NPDC-DS-2023-ARC-03', 'PUB-2023-03'],
        sourceReferences: [
          {
            title: researchProjects[2].title,
            type: 'Official Research Record',
            url: researchProjects[2].sourceUrl,
            identifier: 'POL-PRJ-2023-03'
          },
          {
            title: 'IndARC Mooring High-Frequency Hydrographic Profile Series',
            type: 'NPDC In-Situ Dataset',
            url: 'https://ncpor.res.in/pages/display/398-indarc',
            identifier: 'NPDC-DS-2023-ARC-03'
          }
        ],

        generatedBy: researcherUser._id,
        authorName: researcherUser.name,
        status: 'in_review',
        reviewComment: 'Under final scientific review by MoES Polar Directorate.',
        isCuratorVerified: false
      },
      {
        title: 'Aerosol Whispers: What Clean Polar Air at Bharati Station Teaches Us About Planetary Health',
        content: `India’s Bharati Station is perched on the pristine edge of Larsemann Hills in East Antarctica. With air so clean that black carbon levels measure below 15 nanograms per cubic meter, our scientists can detect the faint fingerprints of global shipping corridors and natural sea spray cloud seeding.`,
        keyFacts: [
          'Pristine air at Bharati allows baseline atmospheric testing.',
          'Identified sea spray aerosol interactions that reflect solar heat.'
        ],
        contentType: 'Social Media Post',
        audience: 'School Student',
        projectId: 'POL-PRJ-2023-02',
        projectTitle: researchProjects[1].title,
        sourceIds: ['POL-PRJ-2023-02'],
        sourceReferences: [
          {
            title: researchProjects[1].title,
            type: 'Official Research Record',
            url: researchProjects[1].sourceUrl,
            identifier: 'POL-PRJ-2023-02'
          }
        ],
        generatedBy: studentUser._id,
        authorName: studentUser.name,
        status: 'draft',
        isCuratorVerified: false
      }
    ]);

    // 4. Seed Audit Activities
    console.log('[POLARIS-SEED] Logging initial audit trail...');
    await Activity.create([
      {
        action: 'Curator Verified & Published Content',
        actorName: adminUser.name,
        actorRole: 'admin',
        targetType: 'Content',
        targetTitle: 'Deep Freeze Sentinels: How Maitri Station Decodes Antarctica’s Permafrost',
        details: 'Approved and published for public educational outreach.'
      },
      {
        action: 'Submitted for Curator Review',
        actorName: researcherUser.name,
        actorRole: 'researcher',
        targetType: 'Content',
        targetTitle: 'IndARC in the Arctic: Decoding the Secret Link Between Ny-Ålesund and the Indian Monsoon',
        details: 'Awaiting MoES editorial review.'
      },
      {
        action: 'System Seed Initialized',
        actorName: 'POLARIS Core System',
        actorRole: 'system',
        targetType: 'System',
        targetTitle: 'NCPOR / NPDC Knowledge Seed Imported',
        details: 'Stations, Expeditions, Projects, Datasets, and Publications synced.'
      }
    ]);

    console.log('================================================================');
    console.log('✅ POLARIS Database successfully seeded with official metadata!');
    console.log('----------------------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin:      admin@polaris.demo      / polaris123');
    console.log('  Researcher: researcher@polaris.demo / polaris123');
    console.log('  Student:    student@polaris.demo    / polaris123');
    console.log('================================================================');

    if (shouldExit) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[POLARIS-SEED] Seeding failed:', error);
    if (shouldExit) process.exit(1);
  }
};

// Check if running directly via command line
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedData(true);
  })();
}

module.exports = seedData;
