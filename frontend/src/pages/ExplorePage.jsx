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
  const [activeMediaModal, setActiveMediaModal] = useState(null);

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

  // Exact 7 tabs required:
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
  const domains = ['All', 'Cryosphere', 'Atmosphere', 'Oceanography', 'Biology', 'Geophysics', 'Climate Science'];
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

  const getItemAccentColor = (item) => {
    const t = (item.type || '').toLowerCase();
    const r = (item.region || '').toLowerCase();
    const d = (item.scienceDomain || '').toLowerCase();
    if (d.includes('atmosphere') || d.includes('climate') || d.includes('meteorolog')) return 'bg-amber-500';
    if (d.includes('cryosphere') || d.includes('glacier') || d.includes('ice')) return 'bg-sky-400';
    if (d.includes('ocean') || d.includes('marine')) return 'bg-teal-600';
    if (d.includes('bio') || d.includes('ecolog') || d.includes('flora')) return 'bg-emerald-500';
    if (d.includes('geo') || d.includes('seismic')) return 'bg-indigo-500';
    if (r.includes('antarctica')) return 'bg-sky-400';
    if (r.includes('southern ocean')) return 'bg-teal-600';
    if (r.includes('himalaya')) return 'bg-indigo-500';
    if (t === 'station') return 'bg-teal-700';
    if (t === 'report') return 'bg-amber-600';
    if (t === 'publication') return 'bg-indigo-600';
    if (t === 'dataset') return 'bg-sky-600';
    return 'bg-slate-400';
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
      accentColor={getItemAccentColor(item)}
      className="border-slate-200/90 group"
    >
      <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">{item.type}</span>
              {item.scienceDomain && <span className="text-slate-400 text-[11px]">• {item.scienceDomain}</span>}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              {item.region && <span className="font-semibold text-slate-700">{item.region}</span>}
              {item.year && <span>• {item.year}</span>}
            </div>
          </div>

          <Link to={item.link} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
              {item.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
            {item.station && <span>📍 Station: <strong className="text-slate-700">{item.station}</strong></span>}
            {item.authors && <span>Authors: {item.authors.slice(0, 2).join(', ')}{item.authors.length > 2 ? ' et al.' : ''}</span>}
            {item.lead && <span>Lead: <strong className="text-slate-700">{item.lead}</strong></span>}
            {item.source && <span className="text-slate-400 font-mono">Source: {item.source}</span>}
            {item.doi && <span className="text-teal-700 font-mono">DOI: {item.doi}</span>}
            {item.accessType && (
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {item.accessType}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-2 md:pt-0">
          <Link to={item.link}>
            <Button variant="secondary" size="sm" className="whitespace-nowrap flex items-center gap-1 text-xs text-teal-700 font-semibold border-slate-200">
              <span>View Record</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );

  // Render media card
  const renderMediaCard = (m) => (
    <Card
      key={m.id || m._id}
      hover
      onClick={() => setActiveMediaModal(m)}
      className="overflow-hidden flex flex-col justify-between border-slate-200 hover:border-teal-700 cursor-pointer group transition-all"
    >
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        <img
          src={m.url}
          alt={m.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            if (!e.target.dataset.fallbackApplied) {
              e.target.dataset.fallbackApplied = 'true';
              const regionFallbacks = {
                antarctica: '/stations/bharati.jpg',
                arctic: '/stations/himadri.jpg',
                himalaya: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
                'southern ocean': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'
              };
              e.target.src = regionFallbacks[(m.region || '').toLowerCase()] || '/stations/bharati.jpg';
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
          <Badge variant={m.region?.toLowerCase()}>{m.region}</Badge>
          {m.scienceDomain && (
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
              {m.scienceDomain}
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
          {m.mediaType || 'image'}
        </div>
      </div>
      <div className="p-3 space-y-1">
        <h4 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-teal-800 transition-colors">
          {m.title}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
          {m.description}
        </p>
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
        <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
          Ministry of Earth Sciences (MoES) • NCPOR
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Beyond Boundary, Beyond Limits
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Search across polar stations, expeditions, technical reports, publications, datasets, and outreach media.
        </p>
      </div>

      {/* 2. HERO SEARCH BAR */}
      <div className="bg-white border-2 border-slate-200 focus-within:border-teal-700 rounded-xl shadow-xs p-2 transition-all">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Search polar research, stations, datasets, expeditions, permafrost, temperature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-2 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
              className={`px-3 py-2 font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                selectedType === tab.id
                  ? 'border-teal-700 text-teal-800 bg-teal-50/50 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === tab.id ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
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

      {/* Lightbox / High-Res Preview Modal */}
      {activeMediaModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[55vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={activeMediaModal.url}
                alt={activeMediaModal.title}
                referrerPolicy="no-referrer"
                className="max-h-[55vh] w-auto object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => setActiveMediaModal(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3">
                <Badge variant={activeMediaModal.region?.toLowerCase()}>{activeMediaModal.region}</Badge>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest">
                  {activeMediaModal.category || 'Photograph'} • {activeMediaModal.station || activeMediaModal.region}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {activeMediaModal.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeMediaModal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Photo Credit</span>
                  <span className="font-semibold text-slate-700">{activeMediaModal.source}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Region</span>
                  <span className="font-semibold text-slate-700">{activeMediaModal.region}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Catalog Identifier</span>
                  <span className="font-mono text-slate-700">{activeMediaModal.id}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <a
                  href={activeMediaModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full-Resolution Source</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMediaModal(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
