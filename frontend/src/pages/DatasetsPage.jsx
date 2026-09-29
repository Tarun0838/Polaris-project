import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Filter, ExternalLink, Lock, Unlock, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export const DatasetsPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedAccess, setSelectedAccess] = useState('All');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get('/datasets', {
          params: { region: selectedRegion, accessType: selectedAccess }
        });
        setDatasets(response.data.data || []);
      } catch (err) {
        console.error('Failed to load datasets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, [selectedRegion, selectedAccess]);

  const regions = ['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];
  const accessTypes = ['All', 'Open Access', 'Request Data via NPDC'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-1">
          National Polar Data Centre (NPDC)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Polar Scientific Datasets
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Catalog of in-situ observational measurements, satellite calibrations, and oceanographic casts. Data requests adhere strictly to the Ministry of Earth Sciences Data Policy.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-500">Filter By:</span>

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
            value={selectedAccess}
            onChange={(e) => setSelectedAccess(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-hidden"
          >
            {accessTypes.map((a) => (
              <option key={a} value={a}>{a === 'All' ? 'All Access Types' : a}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-700">
          {datasets.length} Datasets Cataloged
        </span>
      </div>

      {/* Datasets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {datasets.map((d) => (
            <Card key={d.datasetId} hover className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={d.region.toLowerCase()}>{d.region}</Badge>
                    <Badge variant={d.accessType === 'Open Access' ? 'open-access' : 'request-data'}>
                      {d.accessType}
                    </Badge>
                  </div>
                  <Badge variant="verified">Official Source</Badge>
                </div>

                <Link to={`/datasets/${d.datasetId}`}>
                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                    {d.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {d.description}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {d.stationName && <span>📍 {d.stationName}</span>}
                  <span>📁 {d.format}</span>
                  <span>📦 {d.fileSize}</span>
                  <span className="font-mono">Year: {d.year}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {d.datasetId}
                </span>
                <Link to={`/datasets/${d.datasetId}`}>
                  <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1">
                    <span>Dataset Details & Access</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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

export default DatasetsPage;
