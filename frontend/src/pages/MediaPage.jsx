import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, Filter, ExternalLink, MapPin } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Skeleton';

export const MediaPage = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await api.get('/media', {
          params: { region: selectedRegion, category: selectedCategory }
        });
        setMediaList(response.data.data || []);
      } catch (err) {
        console.error('Failed to load media:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [selectedRegion, selectedCategory]);

  const regions = ['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];
  const categories = ['All', 'Station', 'Expedition', 'Instrumentation', 'Wildlife'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
          Visual Dissemination Archive
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Polar Photographic & Video Media
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          High-resolution observational photography and mission footage from Indian stations, field operations, and polar wildlife.
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-700">
          {mediaList.length} Media Records
        </span>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
          No media records match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaList.map((m) => (
            <Card key={m.mediaId} hover className="overflow-hidden flex flex-col justify-between">
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={m.url}
                  alt={m.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant={m.region.toLowerCase()}>{m.region}</Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  {m.type === 'video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                  <span className="capitalize">{m.type}</span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
                    {m.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                    {m.caption}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{m.stationName || m.region}</span>
                  <span className="truncate max-w-[150px]">Source: {m.credit}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPage;
