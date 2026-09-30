const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const ResearchProject = require('../models/ResearchProject');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Publication = require('../models/Publication');
const Expedition = require('../models/Expedition');
const Station = require('../models/Station');
const Media = require('../models/Media');

// Common English stopwords to ignore in topic-based multi-word searches
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'changes', 'change', 'over', 'into'
]);

// Topic synonyms and concept expansions for polar science
const TOPIC_CONCEPT_MAP = {
  temperature: ['thermal', 'permafrost', 'warming', 'heat', 'temperature', 'thaw', 'meteorological'],
  warming: ['temperature', 'climate', 'melt', 'thermal', 'active layer'],
  climate: ['warming', 'temperature', 'atmosphere', 'cryosphere', 'greenhouse'],
  permafrost: ['active layer', 'borehole', 'soil temperature', 'thaw depth', 'schirmacher'],
  glacier: ['ice', 'glaciology', 'mass balance', 'ablation', 'meltwater', 'retreat', 'sutri dhaka'],
  ocean: ['oceanography', 'indarc', 'current', 'salinity', 'kongsfjorden', 'sea', 'water'],
  monsoon: ['teleconnection', 'indarc', 'rossby', 'precipitation', 'indian monsoon']
};

// Project ID to primary science domain mapping
const PROJECT_DOMAIN_MAP = {
  'POL-PRJ-2023-01': 'Cryosphere',
  'POL-PRJ-2023-02': 'Atmosphere',
  'POL-PRJ-2023-03': 'Oceanography',
  'POL-PRJ-2023-04': 'Cryosphere',
  'POL-PRJ-2022-05': 'Biology',
  'POL-PRJ-2020-06': 'Oceanography'
};

// Domain keywords and semantic indicators for polar science
const DOMAIN_KEYWORDS_MAP = {
  atmosphere: [
    'atmosphere', 'atmospheric', 'meteorolog', 'weather', 'aerosol',
    'black carbon', 'air quality', 'ozone', 'wind', 'radiation budget',
    'cloud', 'greenhouse gas', 'trace gas', 'boundary layer',
    'troposphere', 'stratosphere', 'radiosonde', 'sun photometer', 'aethalometer',
    'katabatic'
  ],
  cryosphere: [
    'cryosphere', 'cryospheric', 'glacier', 'glacial', 'glaciolog',
    'ice', 'snow', 'permafrost', 'ice-core', 'ice core', 'ablation',
    'moraine', 'subglacial', 'crevasse', 'calving', 'meltwater',
    'frost', 'blue-ice', 'ice sheet', 'firn'
  ],
  oceanography: [
    'ocean', 'oceanograph', 'marine', 'hydrographic', 'sea', 'salinity',
    'current', 'ctd', 'mooring', 'buoy', 'indarc', 'water mass',
    'vessel', 'cruise', 'transect', 'bathymetry', 'coastal', 'fjord',
    'kongsfjorden', 'sea-ice', 'sea ice', 'polar front'
  ],
  biology: [
    'biology', 'biological', 'flora', 'fauna', 'microbiol', 'bacteria',
    'psychrophil', 'microbial', 'wildlife', 'penguin', 'krill',
    'zooplankton', 'phytoplankton', 'plankton', 'trophic', 'copepod',
    'pteropod', 'biodiversity', 'lichen', 'moss', 'ecosystem',
    'ecology', 'benthic', 'algae', 'living resources'
  ],
  geophysics: [
    'geophysic', 'geolog', 'geomagnet', 'seismic', 'magnetism',
    'tectonic', 'bedrock', 'gondwana', 'crustal', 'crust', 'paleoclimate',
    'magnetometer', 'gravity', 'rock', 'geomorphology', 'strata', 'mineral'
  ],
  'climate science': [
    'climate', 'warming', 'greenhouse', 'carbon sink', 'carbon flux',
    'carbon sequestration', 'radiative forcing', 'albedo', 'carbon drawdown',
    'arctic amplification', 'teleconnection'
  ]
};
DOMAIN_KEYWORDS_MAP['climate'] = DOMAIN_KEYWORDS_MAP['climate science'];

/**
 * Determine if a document matches the requested scientific domain
 */
function itemMatchesDomain(doc, docType, targetDomain) {
  if (!targetDomain || targetDomain === 'All') return true;
  const target = targetDomain.toLowerCase().trim();

  // 1. Direct scienceDomain field
  if (doc.scienceDomain) {
    const docDom = doc.scienceDomain.toLowerCase().trim();
    if (docDom === target) return true;
    if (target === 'climate science' && docDom === 'climate') return true;
    if (target === 'climate' && docDom === 'climate science') return true;
    if (docType === 'Dataset' || docType === 'Publication' || docType === 'Research Project') {
      return false;
    }
  }

  // 2. Check linked project ID (authoritative for records tied to a specific project)
  if (doc.projectId && PROJECT_DOMAIN_MAP[doc.projectId]) {
    const projDomain = PROJECT_DOMAIN_MAP[doc.projectId].toLowerCase();
    if (target === 'climate science' && projDomain === 'climate') return true;
    if (target === 'climate' && projDomain === 'climate science') return true;
    return projDomain === target;
  }

  // 3. Station scienceFocus (authoritative discipline focus for research stations)
  if (docType === 'Station') {
    if (Array.isArray(doc.scienceFocus)) {
      const focusBlob = doc.scienceFocus.join(' ').toLowerCase();
      const keywords = DOMAIN_KEYWORDS_MAP[target] || [target];
      return keywords.some(kw => focusBlob.includes(kw));
    }
    return false;
  }

  // 4. Expedition objectives & mandate (authoritative for expeditions)
  if (docType === 'Expedition') {
    const expBlob = [
      Array.isArray(doc.objectives) ? doc.objectives.join(' ') : '',
      doc.summary || '',
      doc.name || ''
    ].join(' ').toLowerCase();
    const keywords = DOMAIN_KEYWORDS_MAP[target] || [target];
    return keywords.some(kw => expBlob.includes(kw));
  }

  // 5. Fallback keyword check across searchable textual fields
  const textBlob = [
    doc.title,
    doc.caption,
    doc.description,
    doc.summary,
    doc.category,
    doc.reportType,
    doc.authoringBody,
    Array.isArray(doc.tags) ? doc.tags.join(' ') : doc.tags,
    Array.isArray(doc.parameters) ? doc.parameters.join(' ') : doc.parameters
  ].filter(Boolean).join(' ').toLowerCase();

  const keywords = DOMAIN_KEYWORDS_MAP[target] || [target];
  return keywords.some(kw => textBlob.includes(kw));
}

/**
 * Resolve the best primary science domain label for an item
 */
function resolvePrimaryDomain(doc, docType) {
  if (doc.scienceDomain) return doc.scienceDomain;
  if (doc.projectId && PROJECT_DOMAIN_MAP[doc.projectId]) {
    return PROJECT_DOMAIN_MAP[doc.projectId];
  }

  const textBlob = [
    doc.title,
    doc.caption,
    doc.description,
    doc.summary,
    doc.category,
    doc.reportType,
    doc.authoringBody,
    Array.isArray(doc.scienceFocus) ? doc.scienceFocus.join(' ') : '',
    Array.isArray(doc.objectives) ? doc.objectives.join(' ') : '',
    Array.isArray(doc.tags) ? doc.tags.join(' ') : ''
  ].filter(Boolean).join(' ').toLowerCase();

  const domainCandidates = [
    { name: 'Atmosphere', key: 'atmosphere' },
    { name: 'Cryosphere', key: 'cryosphere' },
    { name: 'Oceanography', key: 'oceanography' },
    { name: 'Biology', key: 'biology' },
    { name: 'Geophysics', key: 'geophysics' },
    { name: 'Climate Science', key: 'climate science' }
  ];

  let bestDomain = null;
  let maxMatches = 0;

  for (const candidate of domainCandidates) {
    const keywords = DOMAIN_KEYWORDS_MAP[candidate.key] || [];
    let count = 0;
    for (const kw of keywords) {
      if (textBlob.includes(kw)) count++;
    }
    if (count > maxMatches) {
      maxMatches = count;
      bestDomain = candidate.name;
    }
  }

  return bestDomain || 'General';
}

/**
 * Tokenize search query and extract key terms and concepts
 */
function extractSearchTokens(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return [];
  const clean = rawQuery.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 1 && !STOPWORDS.has(w));
  return words;
}

/**
 * Score a document's relevance against tokens and query
 */
function calculateRelevance(docText, query, tokens) {
  let score = 0;
  const lowerText = (docText || '').toLowerCase();
  const lowerQuery = query.toLowerCase().trim();

  // Exact phrase match gives high boost
  if (lowerQuery && lowerText.includes(lowerQuery)) {
    score += 15;
  }

  // Token matches
  tokens.forEach(token => {
    if (lowerText.includes(token)) {
      score += 4;
    }
    // Concept expansions
    const synonyms = TOPIC_CONCEPT_MAP[token] || [];
    synonyms.forEach(syn => {
      if (lowerText.includes(syn)) {
        score += 2;
      }
    });
  });

  return score;
}

// @desc    Global unified search across polar collections with categorization and topic-matching
// @route   GET /api/search?q=&type=&region=&domain=&year=&station=&expedition=
// @access  Public
const searchAll = async (req, res, next) => {
  try {
    const {
      q = '',
      type = 'All',
      region = 'All',
      domain = 'All',
      year = 'All',
      station = 'All',
      expedition = 'All',
      page = 1,
      limit = 50
    } = req.query;

    const trimmedQuery = q.trim();
    const tokens = extractSearchTokens(trimmedQuery);

    const safeLoadSeed = (file) => {
      try {
        const raw = fs.readFileSync(path.join(__dirname, '../seed', file), 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        return [];
      }
    };

    // Build filter for exact filters (region, domain, year, station)
    const applyStandardFilters = (doc, docType) => {
      if (region && region !== 'All') {
        const docRegion = (doc.region || '').toLowerCase();
        if (docRegion !== region.toLowerCase()) return false;
      }
      if (domain && domain !== 'All') {
        if (!itemMatchesDomain(doc, docType, domain)) return false;
      }
      if (year && year !== 'All') {
        if (doc.year) {
          const docYear = String(doc.year || '');
          if (!docYear.includes(String(year))) return false;
        } else if (docType !== 'Media' && docType !== 'Station') {
          return false;
        }
      }
      if (station && station !== 'All') {
        const stLower = station.toLowerCase();
        const docSt = (doc.stationName || doc.stationId || doc.name || '').toLowerCase();
        const docStations = Array.isArray(doc.stations) ? doc.stations.map(s => s.toLowerCase()) : [];
        if (!docSt.includes(stLower) && !docStations.includes(stLower)) return false;
      }
      return true;
    };

    // If query is provided, check if document matches query tokens or concepts
    const matchesQuery = (doc, searchableString) => {
      if (!trimmedQuery) return { matched: true, score: 1 };

      const score = calculateRelevance(searchableString, trimmedQuery, tokens);
      return { matched: score > 0, score };
    };

    // Initialize categorized buckets
    const categorized = {
      stations: [],
      expeditions: [],
      research: [],
      datasets: [],
      reports: [],
      publications: [],
      media: []
    };

    // 1. STATIONS
    let stationsData = [];
    if (mongoose.connection.readyState === 1) {
      try { stationsData = await Station.find().lean(); } catch (e) {}
    }
    if (!stationsData || stationsData.length === 0) stationsData = safeLoadSeed('stations.json');
    stationsData.forEach(s => {
      const searchBlob = `${s.name} ${s.stationId} ${s.region} ${s.location} ${s.description} ${(s.scienceFocus || []).join(' ')}`;
      const { matched, score } = matchesQuery(s, searchBlob);
      if (matched && applyStandardFilters(s, 'Station')) {
        categorized.stations.push({
          id: s.stationId,
          _id: s._id,
          title: `${s.name} Station`,
          type: 'Station',
          region: s.region,
          year: s.establishedYear,
          scienceDomain: s.scienceDomain || resolvePrimaryDomain(s, 'Station'),
          description: s.description,
          source: 'NCPOR Official Base',
          sourceUrl: s.sourceUrl,
          verificationStatus: s.verificationStatus,
          link: `/stations/${s.stationId}`,
          score
        });
      }
    });

    // 2. EXPEDITIONS
    let expeditionsData = [];
    if (mongoose.connection.readyState === 1) {
      try { expeditionsData = await Expedition.find().lean(); } catch (e) {}
    }
    if (!expeditionsData || expeditionsData.length === 0) expeditionsData = safeLoadSeed('expeditions.json');
    expeditionsData.forEach(e => {
      const searchBlob = `${e.name} ${e.shortName} ${e.expeditionId} ${e.region} ${e.year} ${e.summary} ${(e.objectives || []).join(' ')} ${(e.stations || []).join(' ')} ${e.leader?.name}`;
      const { matched, score } = matchesQuery(e, searchBlob);
      if (matched && applyStandardFilters(e, 'Expedition')) {
        categorized.expeditions.push({
          id: e.expeditionId,
          _id: e._id,
          title: e.name,
          type: 'Expedition',
          region: e.region,
          year: e.year,
          scienceDomain: e.scienceDomain || resolvePrimaryDomain(e, 'Expedition'),
          stations: e.stations,
          description: e.summary,
          source: e.organization,
          sourceUrl: e.sourceUrl,
          verificationStatus: e.verificationStatus,
          link: `/expeditions/${e.expeditionId}`,
          score
        });
      }
    });

    // 3. RESEARCH PROJECTS
    let projectsData = [];
    if (mongoose.connection.readyState === 1) {
      try { projectsData = await ResearchProject.find().lean(); } catch (e) {}
    }
    if (!projectsData || projectsData.length === 0) projectsData = safeLoadSeed('researchProjects.json');
    projectsData.forEach(p => {
      const searchBlob = `${p.title} ${p.shortDescription} ${p.description} ${p.region} ${p.scienceDomain} ${p.stationName} ${p.expeditionName} ${(p.keywords || []).join(' ')} ${(p.keyFindings || []).join(' ')} ${p.leadResearcher?.name}`;
      const { matched, score } = matchesQuery(p, searchBlob);
      if (matched && applyStandardFilters(p, 'Research Project')) {
        categorized.research.push({
          id: p.projectId,
          _id: p._id,
          title: p.title,
          type: 'Research Project',
          region: p.region,
          scienceDomain: p.scienceDomain || resolvePrimaryDomain(p, 'Research Project'),
          year: p.year,
          station: p.stationName,
          expedition: p.expeditionName,
          description: p.shortDescription || p.description,
          source: p.sourceType,
          sourceUrl: p.sourceUrl,
          lead: p.leadResearcher?.name,
          verificationStatus: p.verificationStatus,
          link: `/research/${p.projectId}`,
          score
        });
      }
    });

    // 4. DATASETS
    let datasetsData = [];
    if (mongoose.connection.readyState === 1) {
      try { datasetsData = await Dataset.find().lean(); } catch (e) {}
    }
    if (!datasetsData || datasetsData.length === 0) datasetsData = safeLoadSeed('datasets.json');
    datasetsData.forEach(d => {
      const searchBlob = `${d.title} ${d.description} ${d.datasetId} ${d.scienceDomain} ${d.region} ${d.stationName} ${(d.parameters || []).join(' ')} ${d.format} ${d.accessType}`;
      const { matched, score } = matchesQuery(d, searchBlob);
      if (matched && applyStandardFilters(d, 'Dataset')) {
        categorized.datasets.push({
          id: d.datasetId,
          _id: d._id,
          title: d.title,
          type: 'Dataset',
          region: d.region,
          scienceDomain: d.scienceDomain || resolvePrimaryDomain(d, 'Dataset'),
          year: d.year,
          station: d.stationName,
          expedition: d.expeditionName,
          description: d.description,
          source: d.provider,
          sourceUrl: d.sourceUrl,
          accessType: d.accessType,
          format: d.format,
          verificationStatus: d.verificationStatus,
          link: `/datasets/${d.datasetId}`,
          score
        });
      }
    });

    // 5. REPORTS
    let reportsData = [];
    if (mongoose.connection.readyState === 1) {
      try { reportsData = await Report.find().lean(); } catch (e) {}
    }
    if (!reportsData || reportsData.length === 0) reportsData = safeLoadSeed('reports.json');
    reportsData.forEach(r => {
      const searchBlob = `${r.title} ${r.summary} ${r.reportType} ${r.region} ${r.stationName} ${r.expeditionName} ${r.authoringBody}`;
      const { matched, score } = matchesQuery(r, searchBlob);
      if (matched && applyStandardFilters(r, 'Report')) {
        categorized.reports.push({
          id: r.reportId,
          _id: r._id,
          title: r.title,
          type: 'Report',
          reportType: r.reportType,
          region: r.region,
          year: r.year,
          scienceDomain: r.scienceDomain || resolvePrimaryDomain(r, 'Report'),
          station: r.stationName,
          expedition: r.expeditionName,
          description: r.summary,
          source: r.authoringBody,
          sourceUrl: r.sourceUrl,
          verificationStatus: r.verificationStatus,
          link: `/reports/${r.reportId}`,
          score
        });
      }
    });

    // 6. PUBLICATIONS
    let publicationsData = [];
    if (mongoose.connection.readyState === 1) {
      try { publicationsData = await Publication.find().lean(); } catch (e) {}
    }
    if (!publicationsData || publicationsData.length === 0) publicationsData = safeLoadSeed('publications.json');
    publicationsData.forEach(pub => {
      const searchBlob = `${pub.title} ${pub.abstract} ${pub.journal} ${pub.doi} ${pub.region} ${pub.scienceDomain} ${(pub.authors || []).join(' ')} ${pub.stationName}`;
      const { matched, score } = matchesQuery(pub, searchBlob);
      if (matched && applyStandardFilters(pub, 'Publication')) {
        categorized.publications.push({
          id: pub.publicationId,
          _id: pub._id,
          title: pub.title,
          type: 'Publication',
          region: pub.region,
          scienceDomain: pub.scienceDomain || resolvePrimaryDomain(pub, 'Publication'),
          year: pub.year,
          station: pub.stationName,
          description: pub.abstract,
          source: pub.journal,
          sourceUrl: pub.sourceUrl,
          doi: pub.doi,
          authors: pub.authors,
          verificationStatus: pub.verificationStatus,
          link: `/publications/${pub.publicationId}`,
          score
        });
      }
    });

    // 7. MEDIA (Photos & Videos)
    let mediaData = [];
    if (mongoose.connection.readyState === 1) {
      try { mediaData = await Media.find().lean(); } catch (e) {}
    }
    if (!mediaData || mediaData.length === 0) mediaData = safeLoadSeed('media.json');
    mediaData.forEach(m => {
      const searchBlob = `${m.title} ${m.caption} ${m.category} ${m.region} ${m.stationName} ${m.credit}`;
      const { matched, score } = matchesQuery(m, searchBlob);
      if (matched && applyStandardFilters(m, 'Media')) {
        categorized.media.push({
          id: m.mediaId,
          _id: m._id,
          title: m.title,
          type: 'Media',
          mediaType: m.type,
          category: m.category,
          region: m.region,
          scienceDomain: m.scienceDomain || resolvePrimaryDomain(m, 'Media'),
          station: m.stationName,
          description: m.caption,
          url: m.url,
          source: m.credit,
          link: `/explore?type=Media&q=${encodeURIComponent(m.title)}`,
          score
        });
      }
    });

    // Sort each category by relevance score descending, then year
    const sortList = (list) => {
      return list.sort((a, b) => {
        if ((b.score || 0) !== (a.score || 0)) {
          return (b.score || 0) - (a.score || 0);
        }
        const yrA = parseInt(a.year) || 0;
        const yrB = parseInt(b.year) || 0;
        return yrB - yrA;
      });
    };

    Object.keys(categorized).forEach(k => {
      categorized[k] = sortList(categorized[k]);
    });

    // Category Counts - matching the 6 active repository categories
    const counts = {
      all: categorized.stations.length +
           categorized.expeditions.length +
           categorized.reports.length +
           categorized.publications.length +
           categorized.datasets.length +
           categorized.media.length,
      stations: categorized.stations.length,
      expeditions: categorized.expeditions.length,
      research: categorized.research.length,
      datasets: categorized.datasets.length,
      reports: categorized.reports.length,
      publications: categorized.publications.length,
      media: categorized.media.length
    };

    // Filter results according to requested type
    let combinedResults = [];
    const normalizedType = type.toLowerCase();

    if (normalizedType === 'all') {
      combinedResults = [
        ...categorized.stations,
        ...categorized.expeditions,
        ...categorized.reports,
        ...categorized.publications,
        ...categorized.datasets,
        ...categorized.media
      ];
    } else if (normalizedType === 'stations' || normalizedType === 'station') {
      combinedResults = categorized.stations;
    } else if (normalizedType === 'expeditions' || normalizedType === 'expedition') {
      combinedResults = categorized.expeditions;
    } else if (normalizedType === 'research projects' || normalizedType === 'research') {
      combinedResults = categorized.research;
    } else if (normalizedType === 'datasets' || normalizedType === 'dataset') {
      combinedResults = categorized.datasets;
    } else if (normalizedType === 'reports' || normalizedType === 'report') {
      combinedResults = categorized.reports;
    } else if (normalizedType === 'publications' || normalizedType === 'publication') {
      combinedResults = categorized.publications;
    } else if (normalizedType === 'media') {
      combinedResults = categorized.media;
    }

    // Sort final combined list by score
    combinedResults = sortList(combinedResults);

    const total = combinedResults.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = combinedResults.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total,
      counts,
      categorized,
      results: paginatedResults,
      query: q,
      filters: { q, type, region, domain, year, station, expedition }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchAll
};
