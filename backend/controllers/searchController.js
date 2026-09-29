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

    // Build base MongoDB filter for exact filters (region, domain, year, station)
    const applyStandardFilters = (doc, docType) => {
      if (region && region !== 'All') {
        const docRegion = (doc.region || '').toLowerCase();
        if (docRegion !== region.toLowerCase()) return false;
      }
      if (domain && domain !== 'All') {
        const docDomain = (doc.scienceDomain || '').toLowerCase();
        if (docDomain !== domain.toLowerCase()) return false;
      }
      if (year && year !== 'All') {
        const docYear = String(doc.year || '');
        if (!docYear.includes(String(year))) return false;
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
    const stationsData = await Station.find().lean();
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
    const expeditionsData = await Expedition.find().lean();
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
    const projectsData = await ResearchProject.find().lean();
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
          scienceDomain: p.scienceDomain,
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
    const datasetsData = await Dataset.find().lean();
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
          scienceDomain: d.scienceDomain,
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
    const reportsData = await Report.find().lean();
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
    const publicationsData = await Publication.find().lean();
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
          scienceDomain: pub.scienceDomain,
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
    const mediaData = await Media.find().lean();
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

    // Category Counts
    const counts = {
      all: categorized.stations.length +
           categorized.expeditions.length +
           categorized.research.length +
           categorized.datasets.length +
           categorized.reports.length +
           categorized.publications.length +
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
        ...categorized.research,
        ...categorized.datasets,
        ...categorized.reports,
        ...categorized.publications,
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
