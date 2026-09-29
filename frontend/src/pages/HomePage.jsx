import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Database,
  Ship,
  Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/projects');
        setFeaturedProjects((response.data.data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured research:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const polarRegions = [
    {
      name: 'Antarctica',
      description: 'Maitri & Bharati permanent stations, Schirmacher Oasis permafrost, Larsemann Hills',
      stations: 'Maitri, Bharati',
      badgeVariant: 'antarctica',
      query: 'Antarctica'
    },
    {
      name: 'Arctic',
      description: 'Himadri station in Ny-Ålesund, Svalbard and IndARC continuous fjord moored observatory',
      stations: 'Himadri',
      badgeVariant: 'arctic',
      query: 'Arctic'
    },
    {
      name: 'Himalaya',
      description: 'Himansh station at 4,080m in Chandra Basin, Sutri Dhaka benchmark glacier monitoring',
      stations: 'Himansh',
      badgeVariant: 'himalaya',
      query: 'Himalaya'
    },
    {
      name: 'Southern Ocean',
      description: 'Deep-sea biogeochemical transects, carbon sequestration and polar front oceanography',
      stations: 'Cruise Operations',
      badgeVariant: 'southern ocean',
      query: 'Southern Ocean'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION - CLEAN, GOVERNMENT SCIENTIFIC PORTAL */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs text-cyan-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Ministry of Earth Sciences (MoES) • NCPOR • SIH Problem Statement 26063</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-heading">
              POLARIS
            </h1>
            <p className="text-lg sm:text-xl font-medium text-cyan-200 font-heading">
              Unified Polar Knowledge Repository
            </p>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            A single integrated national portal connecting India's polar research stations, expeditions, 
            technical reports, peer-reviewed publications, in-situ datasets, and outreach media.
          </p>

          {/* MAIN SEARCH BOX — PRIMARY CTA */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-2 flex items-center gap-2 border border-slate-200"
          >
            <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Search polar research, stations, datasets, expeditions, permafrost..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent px-2 py-2 focus:outline-hidden font-medium"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Prompt sample search suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-1">
            <span>Try searching:</span>
            {['Maitri', 'Antarctica', 'temperature', 'Himadri', 'Himansh', 'permafrost', 'Southern Ocean'].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => navigate(`/explore?q=${encodeURIComponent(kw)}`)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Verification notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Prototype Repository Record • Structured with authentic NCPOR/NPDC polar metadata</span>
          </div>
        </div>
      </section>

      {/* 2. FOUR POLAR REGIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
            Geographic Coverage
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Four Polar Regions
          </h2>
          <p className="text-xs text-slate-500">
            Explore interconnected research records categorized across India's key polar research domains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {polarRegions.map((reg) => (
            <Link
              key={reg.name}
              to={`/explore?region=${encodeURIComponent(reg.query)}`}
              className="group block"
            >
              <Card hover className="p-4 h-full flex flex-col justify-between border-slate-200 group-hover:border-blue-300">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={reg.badgeVariant}>{reg.name}</Badge>
                    <span className="text-[11px] font-mono text-slate-400">{reg.stations}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {reg.name} Repository
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {reg.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore Region</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED / RECENT POLAR RESEARCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
              Connected Knowledge
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Featured Polar Research Records
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Records in Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading research records...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProjects.map((p) => (
              <Card key={p.projectId} hover className="p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={p.region.toLowerCase()}>{p.region}</Badge>
                    <Badge variant="project">{p.scienceDomain}</Badge>
                    <span className="text-xs font-mono text-slate-400">• {p.year}</span>
                    <Badge variant="verified">Verified</Badge>
                  </div>

                  <Link to={`/research/${p.projectId}`}>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                      {p.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {p.shortDescription || p.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>📍 <strong>{p.stationName}</strong></span>
                    {p.leadResearcher?.name && <span>Lead: {p.leadResearcher.name}</span>}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">ID: {p.projectId}</span>
                  <Link to={`/research/${p.projectId}`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      View Connected Record →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 4. FAST SHORTCUTS: POLAR MAP & MEDIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Explore Geographic Discovery & Photographic Media
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Locate stations on the Polar Map, browse expedition timelines, or view photographic archives from Maitri, Bharati, Himadri, and Himansh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/map">
              <Button variant="outline" size="sm" icon={MapPin}>
                Polar Map
              </Button>
            </Link>
            <Link to="/media">
              <Button variant="secondary" size="sm" icon={ImageIcon}>
                Photographic Media
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
