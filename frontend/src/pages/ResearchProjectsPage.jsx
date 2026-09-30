import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, Filter, ArrowRight, MapPin, Ship, Layers } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export const ResearchProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects', {
          params: { region: selectedRegion, domain: selectedDomain }
        });
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [selectedRegion, selectedDomain]);

  const regions = ['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];
  const domains = ['All', 'Cryosphere', 'Atmosphere', 'Oceanography', 'Biology', 'Geophysics', 'Climate Science'];

  const getDomainAccentColor = (domain, region) => {
    const d = (domain || '').toLowerCase();
    const r = (region || '').toLowerCase();
    if (d.includes('cryosphere') || d.includes('glacier') || d.includes('ice') || r.includes('antarctica')) return 'bg-sky-400';
    if (d.includes('atmosphere') || d.includes('climate') || d.includes('meteorolog')) return 'bg-amber-500';
    if (d.includes('ocean') || d.includes('marine') || r.includes('southern ocean')) return 'bg-teal-600';
    if (d.includes('bio') || d.includes('ecolog') || d.includes('flora')) return 'bg-emerald-500';
    if (d.includes('geo') || d.includes('seismic') || r.includes('himalaya')) return 'bg-indigo-500';
    return 'bg-teal-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
          Scientific Knowledge Core
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Polar Research Projects
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Multi-disciplinary polar science programs conducted across India's stations and expeditions. Every project maps directly to verified NPDC datasets and publications.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-500">Filter:</span>
          {/* Region */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-none focus:border-teal-700 font-medium"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>
            ))}
          </select>

          {/* Domain */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-none focus:border-teal-700 font-medium"
          >
            {domains.map((d) => (
              <option key={d} value={d}>{d === 'All' ? 'All Domains' : d}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-600">
          {projects.length} Active Projects
        </span>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const accentColor = getDomainAccentColor(p.scienceDomain, p.region);
            return (
              <Link key={p.projectId} to={`/research/${p.projectId}`} className="group block h-full">
                <Card hover accentColor={accentColor} className="p-6 h-full flex flex-col justify-between border-slate-200/90 group-hover:border-slate-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                        {p.scienceDomain || 'Research'}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {p.region}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2">
                      {p.title}
                    </h3>

                    <div className="text-xs text-slate-500 font-medium space-y-0.5">
                      <div>{p.year ? `${p.year}` : '2023'}</div>
                      <div className="text-slate-700 truncate">
                        {p.leadResearcher?.name ? `${p.leadResearcher.name}${p.leadResearcher.institute ? `, ${p.leadResearcher.institute}` : ''}` : p.stationName}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {p.shortDescription}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">📍 {p.stationName}</span>
                    <span className="text-teal-700 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Explore Graph <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResearchProjectsPage;
