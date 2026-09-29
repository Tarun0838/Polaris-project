import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, Calendar, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports', {
          params: { region: selectedRegion, reportType: selectedType }
        });
        setReports(response.data.data || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [selectedRegion, selectedType]);

  const regions = ['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];
  const reportTypes = ['All', 'Scientific Technical Report', 'Annual Expedition Report', 'Environmental Impact Assessment'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
          MoES / NCPOR Technical Documentation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Polar Scientific & Logistics Reports
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Official annual expedition reports, environmental stewardship assessments, and scientific syntheses published by the Ministry of Earth Sciences.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-500">Filter:</span>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-hidden"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-hidden"
          >
            {reportTypes.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Report Types' : t}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-700">
          {reports.length} Reports Registered
        </span>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((r) => (
            <Card key={r.reportId} hover className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={r.region.toLowerCase()}>{r.region}</Badge>
                    <Badge variant="report">{r.reportType}</Badge>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{r.year}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {r.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {r.summary}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>🏛️ {r.authoringBody}</span>
                  <span>📄 {r.pages} pages</span>
                  {r.stationName && <span>📍 {r.stationName}</span>}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {r.reportId}
                </span>

                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5" icon={ExternalLink}>
                    View Official Source
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
