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

// High-resolution photography of Himalayan peaks, hills, and Antarctic research regions
const heroSlides = [
  {
    id: 'antarctica-bharati',
    title: 'Bharati Permanent Research Station',
    tag: 'East Antarctica (Larsemann Hills)',
    station: 'Bharati Station (Larsemann Hills)',
    description: 'Elevated aerodynamic research station on steel stilts overlooking Antarctic ice leads.',
    image: '/stations/bharati.jpg',
    regionQuery: 'Antarctica'
  },
  {
    id: 'himalaya-himansh',
    title: 'Chandra Basin & Lahaul Spiti Peaks',
    tag: 'Western Himalaya (Third Pole)',
    station: 'Himansh Station (4,080m)',
    description: 'Rugged moraines and high-altitude alpine terrain surrounding India\'s Himansh glaciological research base.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    regionQuery: 'Himalaya'
  },
  {
    id: 'himalaya-samudra',
    title: 'Samudra Tapu Glacial Lake & Moraine Ridges',
    tag: 'Himalayan Cryosphere',
    station: 'Samudra Tapu Field Site',
    description: 'Expanding moraine-dammed glacial lake monitored for GLOF cryospheric hazard evaluation.',
    image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=2000&q=85',
    regionQuery: 'Himalaya'
  },
  {
    id: 'antarctica-maitri',
    title: 'Schirmacher Oasis & Blue-Ice Plateau',
    tag: 'Continental Antarctica',
    station: 'Maitri Station (Schirmacher)',
    description: 'Ice-free rocky oasis situated between the inland ice sheet and the ice shelf in Queen Maud Land.',
    image: '/stations/maitri.jpg',
    regionQuery: 'Antarctica'
  },
  {
    id: 'arctic-himadri',
    title: 'Ny-Ålesund & Kongsfjorden Fjord',
    tag: 'High Arctic (79°N)',
    station: 'Himadri Station (Ny-Ålesund)',
    description: 'India\'s permanent Arctic research station nestled among Spitsbergen peaks and glacial fjords.',
    image: '/stations/himadri.jpg',
    regionQuery: 'Arctic'
  }
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance background slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/projects');
        setFeaturedProjects((response.data.data || []).slice(0, 6));
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

  const getDomainAccentColor = (domain, region) => {
    const d = (domain || '').toLowerCase();
    const r = (region || '').toLowerCase();
    if (d.includes('cryosphere') || d.includes('glacier') || d.includes('ice') || r.includes('antarctica')) {
      return 'bg-sky-400';
    }
    if (d.includes('atmosphere') || d.includes('climate') || d.includes('meteorolog')) {
      return 'bg-amber-500';
    }
    if (d.includes('ocean') || d.includes('marine') || r.includes('southern ocean')) {
      return 'bg-teal-600';
    }
    if (d.includes('bio') || d.includes('ecolog') || d.includes('flora')) {
      return 'bg-emerald-500';
    }
    if (d.includes('geo') || d.includes('seismic') || r.includes('himalaya')) {
      return 'bg-indigo-500';
    }
    return 'bg-teal-700';
  };

  const polarRegions = [
    {
      name: 'Antarctica',
      description: 'Maitri & Bharati permanent stations, Schirmacher Oasis permafrost, Larsemann Hills',
      stations: 'Maitri & Bharati Stations',
      accentColor: 'bg-sky-400',
      tag: 'Polar South',
      query: 'Antarctica'
    },
    {
      name: 'Arctic',
      description: 'Himadri station in Ny-Ålesund, Svalbard and IndARC continuous fjord moored observatory',
      stations: 'Himadri Station (Svalbard)',
      accentColor: 'bg-teal-500',
      tag: 'Polar North',
      query: 'Arctic'
    },
    {
      name: 'Himalaya',
      description: 'Himansh station at 4,080m in Chandra Basin, Sutri Dhaka benchmark glacier monitoring',
      stations: 'Himansh Station (4,080m)',
      accentColor: 'bg-indigo-500',
      tag: 'Third Pole',
      query: 'Himalaya'
    },
    {
      name: 'Southern Ocean',
      description: 'Deep-sea biogeochemical transects, carbon sequestration and polar front oceanography',
      stations: 'Cruise & Research Vessels',
      accentColor: 'bg-blue-600',
      tag: 'Oceanographic',
      query: 'Southern Ocean'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION - CLEAN, WHITE EDITORIAL WITH DYNAMIC POLAR SLIDESHOW */}
      <section className="relative overflow-hidden border-b border-slate-200/90 py-16 sm:py-20 bg-slate-900">
        {/* Dynamic Background Slides: Mountain, Hills, and Antarctica Regions */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out ${
                  idx === currentSlide ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          ))}

          {/* Frosted Light Overlay: Increased visibility for mountain/hills/Antarctica photography */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/45 to-white/75 backdrop-blur-[0.5px]" />
          
          {/* Center focus vignette to keep search bar & typography ultra-clear */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_20%,rgba(255,255,255,0.75)_100%)]" />
        </div>

        {/* Small location indicator pill showing current station / landscape */}
        <div className="absolute bottom-3 right-4 z-10 hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-800 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/90 shadow-xs pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          <span>📍 {heroSlides[currentSlide].station}</span>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/95 border border-slate-200/90 px-3.5 py-1.5 rounded-full text-xs text-slate-800 font-semibold shadow-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>Ministry of Earth Sciences (MoES) • NCPOR • National Polar Repository</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 font-heading drop-shadow-xs">
              VYOM
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-teal-900 font-heading">
              Beyond Boundary, Beyond Limits
            </p>
          </div>

          <p className="text-slate-900 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
            A single integrated national portal connecting India's polar research stations, expeditions, 
            technical reports, peer-reviewed publications, in-situ datasets, and outreach media.
          </p>

          {/* MAIN SEARCH BOX — PRIMARY CTA */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white rounded-xl shadow-md hover:shadow-lg p-2 flex items-center gap-2 border-2 border-slate-200 focus-within:border-teal-700 transition-all"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search polar research, stations, datasets, expeditions, permafrost..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm text-slate-900 placeholder-slate-400 bg-transparent px-2 py-2.5 focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Sample search suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 pt-1">
            <span className="font-semibold text-slate-500">Popular searches:</span>
            {['Maitri', 'Antarctica', 'temperature', 'Himadri', 'Himansh', 'permafrost', 'Southern Ocean'].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => navigate(`/explore?q=${encodeURIComponent(kw)}`)}
                className="bg-white/90 hover:bg-white text-slate-700 px-3 py-1 rounded-md text-xs font-medium border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-xs"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Institutional verification notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-1">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Official MoES Repository Architecture • Standardized with NCPOR & NPDC Polar Metadata</span>
          </div>
        </div>
      </section>

      {/* 2. FOUR POLAR REGIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div>
          <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
            Geographic Coverage
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Four Polar Regions
          </h2>
          <p className="text-xs text-slate-500">
            Explore interconnected research records categorized across India's key polar research domains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {polarRegions.map((reg) => (
            <Link
              key={reg.name}
              to={`/explore?region=${encodeURIComponent(reg.query)}`}
              className="group block"
            >
              <Card hover accentColor={reg.accentColor} className="p-6 h-full flex flex-col justify-between border-slate-200/90 group-hover:border-slate-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">{reg.tag}</span>
                    <span className="text-[11px] font-medium text-slate-400">{reg.stations}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {reg.name} Repository
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {reg.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-teal-700 group-hover:text-teal-800 gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Explore Region</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED / RECENT POLAR RESEARCH (RETHINK PRIORITIES EDITORIAL CARD REFERENCE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
              Connected Knowledge
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Featured Polar Research Records
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>View All Records in Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading research records...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((p) => {
              const accentColor = getDomainAccentColor(p.scienceDomain, p.region);
              return (
                <Link key={p.projectId} to={`/research/${p.projectId}`} className="group block h-full">
                  <Card hover accentColor={accentColor} className="p-6 h-full flex flex-col justify-between border-slate-200/90 group-hover:border-slate-300">
                    <div className="space-y-3">
                      {/* Top category label matching reference photo */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                          {p.scienceDomain || 'Polar Science'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {p.region}
                        </span>
                      </div>

                      {/* Prominent Editorial Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2">
                        {p.title}
                      </h3>

                      {/* Clean Date and Authors / PI */}
                      <div className="text-xs text-slate-500 font-medium space-y-0.5">
                        <div>{p.year ? `${p.year}` : '2023'}</div>
                        <div className="text-slate-700 truncate">
                          {p.leadResearcher?.name ? `${p.leadResearcher.name}${p.leadResearcher.institute ? `, ${p.leadResearcher.institute}` : ''}` : p.stationName}
                        </div>
                      </div>

                      {/* Clean description snippet */}
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {p.shortDescription || p.description}
                      </p>
                    </div>

                    {/* Clean footer info */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-600">📍 {p.stationName}</span>
                      <span className="text-teal-700 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Research <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
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
