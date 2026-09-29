import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Compass,
  MapPin,
  Ship,
  FileText,
  BookOpen,
  Database,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  X,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'All');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'All');
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || 'All');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || 'All');

  const [categorized, setCategorized] = useState({
    stations: [],
    expeditions: [],
    research: [],
    datasets: [],
    reports: [],
    publications: [],
    media: []
  });
  const [counts, setCounts] = useState({
    all: 0,
    stations: 0,
    expeditions: 0,
    reports: 0,
    publications: 0,
    datasets: 0,
    media: 0
  });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Exact 7 tabs required by Section 9 of SIH26063 PSID:
  // [All] [Stations] [Expeditions] [Reports] [Publications] [Datasets] [Media]
  const typeTabs = [
    { id: 'All', label: 'All' },
    { id: 'Stations', label: 'Stations', key: 'stations' },
    { id: 'Expeditions', label: 'Expeditions', key: 'expeditions' },
    { id: 'Reports', label: 'Reports', key: 'reports' },
    { id: 'Publications', label: 'Publications', key: 'publications' },
    { id: 'Datasets', label: 'Datasets', key: 'datasets' },
    { id: 'Media', label: 'Media', key: 'media' }
  ];

  const regions = ['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];
  const domains = ['All', 'Cryosphere', 'Atmosphere', 'Oceanography', 'Biology', 'Geophysics'];
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];

  // Sync state with URL params if user arrives via external link (e.g. region shortcut)
  useEffect(() => {
    const qParam = searchParams.get('q');
    const regParam = searchParams.get('region');
    const typeParam = searchParams.get('type');
    const domainParam = searchParams.get('domain');
    const yearParam = searchParams.get('year');

    if (qParam !== null && qParam !== query) setQuery(qParam);
    if (regParam !== null && regParam !== selectedRegion) setSelectedRegion(regParam);
    if (typeParam !== null && typeParam !== selectedType) setSelectedType(typeParam);
    if (domainParam !== null && domainParam !== selectedDomain) setSelectedDomain(domainParam);
    if (yearParam !== null && yearParam !== selectedYear) setSelectedYear(yearParam);
  }, [searchParams]);

  // Fetch search results with debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSearchResults();
    }, 250);

    return () => clearTimeout(handler);
  }, [query, selectedType, selectedRegion, selectedDomain, selectedYear]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        type: selectedType,
        region: selectedRegion,
        domain: selectedDomain,
        year: selectedYear
      };

      // Sync active search params to URL
      const newParams = {};
      if (query) newParams.q = query;
      if (selectedType !== 'All') newParams.type = selectedType;
      if (selectedRegion !== 'All') newParams.region = selectedRegion;
      if (selectedDomain !== 'All') newParams.domain = selectedDomain;
      if (selectedYear !== 'All') newParams.year = selectedYear;
      setSearchParams(newParams);

      const response = await api.get('/search', { params });
      const data = response.data;

      if (data.categorized) {
        setCategorized(data.categorized);
      }
      if (data.counts) {
        setCounts(data.counts);
      }
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Unified search query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedType('All');
    setSelectedRegion('All');
    setSelectedDomain('All');
    setSelectedYear('All');
  };

  // Helper to render type badge
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'Station':
        return <Badge variant="official">Station</Badge>;
      case 'Expedition':
        return <Badge variant="southern ocean">Expedition</Badge>;
      case 'Report':
        return <Badge variant="report">Technical Report</Badge>;
      case 'Publication':
        return <Badge variant="publication">Publication (DOI)</Badge>;
      case 'Dataset':
        return <Badge variant="dataset">NPDC Dataset</Badge>;
      case 'Media':
        return <Badge variant="verified">Media</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Render individual item card
  const renderItemCard = (item) => (
    <Card
      key={`${item.type}-${item.id || item._id}`}
      hover
      className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-slate-200"
    >
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {renderTypeBadge(item.type)}
          {item.region && <Badge variant={item.region.toLowerCase()}>{item.region}</Badge>}
          {item.scienceDomain && <span className="text-slate-400 font-mono">• {item.scienceDomain}</span>}
          {item.year && <span className="text-slate-400 font-mono">• {item.year}</span>}
          {item.verificationStatus && (
            <Badge variant="verified">Prototype Repository Record</Badge>
          )}
        </div>

        <Link to={item.link}>
          <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
            {item.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5 flex-wrap">
          {item.station && <span>📍 Station: <strong>{item.station}</strong></span>}
          {item.authors && <span>Authors: {item.authors.slice(0, 2).join(', ')}{item.authors.length > 2 ? ' et al.' : ''}</span>}
          {item.lead && <span>Lead: <strong>{item.lead}</strong></span>}
          {item.source && <span className="text-slate-400 font-mono">Source: {item.source}</span>}
          {item.doi && <span className="text-blue-600 font-mono">DOI: {item.doi}</span>}
          {item.accessType && (
            <Badge variant={item.accessType === 'Open Access' ? 'open-access' : 'request-data'}>
              {item.accessType}
            </Badge>
          )}
        </div>
      </div>

      <div className="shrink-0 pt-2 md:pt-0">
        <Link to={item.link}>
          <Button variant="secondary" size="sm" className="whitespace-nowrap flex items-center gap-1 text-xs">
            <span>View Record</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );

  // Render media card
  const renderMediaCard = (m) => (
    <Card key={m.id || m._id} hover className="overflow-hidden flex flex-col justify-between border-slate-200">
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        <img src={m.url} alt={m.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2">
          <Badge variant={m.region?.toLowerCase()}>{m.region}</Badge>
        </div>
        <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
          {m.mediaType || 'image'}
        </div>
      </div>
      <div className="p-3 space-y-1">
        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{m.title}</h4>
        <p className="text-[11px] text-slate-500 line-clamp-2">{m.description}</p>
        <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-100">
          <span>{m.station || m.region}</span>
          <span className="truncate max-w-[120px]">{m.source}</span>
        </div>
      </div>
    </Card>
  );

  // Determine which sections to show
  const showStations = (selectedType === 'All' || selectedType === 'Stations') && categorized.stations.length > 0;
  const showExpeditions = (selectedType === 'All' || selectedType === 'Expeditions') && categorized.expeditions.length > 0;
  const showReports = (selectedType === 'All' || selectedType === 'Reports') && categorized.reports.length > 0;
  const showPublications = (selectedType === 'All' || selectedType === 'Publications') && categorized.publications.length > 0;
  const showDatasets = (selectedType === 'All' || selectedType === 'Datasets') && categorized.datasets.length > 0;
  const showMedia = (selectedType === 'All' || selectedType === 'Media') && categorized.media.length > 0;

  const hasAnyResults = showStations || showExpeditions || showReports || showPublications || showDatasets || showMedia;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. PAGE HEADER */}
      <div>
        <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
          Ministry of Earth Sciences (MoES) • NCPOR
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Unified Polar Knowledge Repository
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Search across polar stations, expeditions, technical reports, publications, datasets, and outreach media.
        </p>
      </div>

      {/* 2. HERO SEARCH BAR */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-xs p-2">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Search polar research, stations, datasets, expeditions, permafrost, temperature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-2 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CATEGORY TABS — EXACT 7 REQUIRED TABS */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {typeTabs.map((tab) => {
          const count = tab.id === 'All' ? counts.all : (counts[tab.key] || 0);
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-2 font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
                selectedType === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. SIMPLE FILTERS BAR */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Regions</option>
            {regions.filter(r => r !== 'All').map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Years</option>
            {years.filter(y => y !== 'All').map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Scientific Domains</option>
            {domains.filter(d => d !== 'All').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Counter & Clear Button */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">
            {loading ? 'Searching repository...' : `${totalCount} records matched`}
          </span>

          {(query || selectedRegion !== 'All' || selectedDomain !== 'All' || selectedYear !== 'All' || selectedType !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. SEARCH RESULTS VIEW */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !hasAnyResults ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching records found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No polar research records matched your query. Try searching for: <br />
            <strong className="text-slate-700">Maitri, Antarctica, temperature, Himadri, Himansh, permafrost, Southern Ocean</strong>.
          </p>
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        /* Grouped Connected Results View (HERO USER JOURNEY) */
        <div className="space-y-8">
          {/* CATEGORY 1: STATIONS */}
          {showStations && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wide">
                    Stations ({categorized.stations.length} result{categorized.stations.length > 1 ? 's' : ''})
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                {categorized.stations.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* CATEGORY 2: EXPEDITIONS */}
          {showExpeditions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wide">
                    Expeditions ({categorized.expeditions.length} result{categorized.expeditions.length > 1 ? 's' : ''})
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                {categorized.expeditions.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* CATEGORY 3: REPORTS */}
          {showReports && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wide">
                    Technical Reports ({categorized.reports.length} result{categorized.reports.length > 1 ? 's' : ''})
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                {categorized.reports.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* CATEGORY 4: PUBLICATIONS */}
          {showPublications && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wide">
                    Publications ({categorized.publications.length} result{categorized.publications.length > 1 ? 's' : ''})
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                {categorized.publications.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* CATEGORY 5: DATASETS */}
          {showDatasets && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wide">
                    NPDC Datasets ({categorized.datasets.length} result{categorized.datasets.length > 1 ? 's' : ''})
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                {categorized.datasets.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* CATEGORY 6: MEDIA */}
          {showMedia && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wide">
                    Media Archive ({categorized.media.length} photograph{categorized.media.length > 1 ? 's' : ''}/video)
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categorized.media.map(renderMediaCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
