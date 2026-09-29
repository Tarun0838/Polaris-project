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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
          Scientific Knowledge Core
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Polar Research Projects
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Multi-disciplinary polar science programs conducted across India's stations and expeditions. Every project maps directly to verified NPDC datasets and publications.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-500">Filter:</span>
          {/* Region */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-hidden"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>
            ))}
          </select>

          {/* Domain */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-hidden"
          >
            {domains.map((d) => (
              <option key={d} value={d}>{d === 'All' ? 'All Domains' : d}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-700">
          {projects.length} Projects Active
        </span>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <Card key={p.projectId} hover className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={p.region.toLowerCase()}>{p.region}</Badge>
                    <Badge variant="project">{p.scienceDomain}</Badge>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-semibold">{p.year}</span>
                </div>

                <Link to={`/research/${p.projectId}`}>
                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                    {p.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {p.shortDescription}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>📍 Station: <strong>{p.stationName}</strong></span>
                  <span>🚢 Expedition: {p.expeditionName}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  PI: <strong className="text-slate-800">{p.leadResearcher?.name}</strong>
                </span>
                <Link to={`/research/${p.projectId}`}>
                  <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1">
                    <span>Explore Knowledge Graph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchProjectsPage;
