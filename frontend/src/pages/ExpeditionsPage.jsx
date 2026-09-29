import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ship, Calendar, MapPin, Users, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export const ExpeditionsPage = () => {
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');

  useEffect(() => {
    const fetchExpeditions = async () => {
      try {
        const response = await api.get('/expeditions', {
          params: { region: selectedRegion }
        });
        setExpeditions(response.data.data || []);
      } catch (err) {
        console.error('Failed to load expeditions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpeditions();
  }, [selectedRegion]);

  const regions = ['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
          National Mission Logs
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Indian Scientific Expeditions
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Explore annual and decadal scientific voyages dispatched to Antarctica, the Arctic, the Southern Ocean, and Himalayan glaciers under the aegis of MoES & NCPOR.
        </p>
      </div>

      {/* Region Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 border-b border-slate-200">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedRegion === r
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Expeditions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expeditions.map((exp) => (
            <Card key={exp.expeditionId} hover className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={exp.region.toLowerCase()}>{exp.region}</Badge>
                    <span className="text-xs font-mono text-slate-600 font-semibold">{exp.year}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{exp.vessel}</span>
                </div>

                <Link to={`/expeditions/${exp.expeditionId}`}>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {exp.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {exp.summary}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>👨‍🔬 Leader: <strong>{exp.leader?.name}</strong></span>
                  {exp.stations?.length > 0 && (
                    <span>📍 Stations: {exp.stations.join(', ')}</span>
                  )}
                  <span>👥 Participants: {exp.participantsCount}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Code: {exp.expeditionId}
                </span>
                <Link to={`/expeditions/${exp.expeditionId}`}>
                  <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1">
                    <span>View Timeline & Science</span>
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

export default ExpeditionsPage;
