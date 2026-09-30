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
  const [activeMedia, setActiveMedia] = useState(null);

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
  const categories = ['All', 'Station', 'Expedition', 'Instrumentation', 'Fieldwork', 'Wildlife'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
          Visual Dissemination Archive • Ministry of Earth Sciences (MoES)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Polar Photographic & Video Media
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          High-resolution observational photography and mission footage from Indian stations, field operations, and polar wildlife.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
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
          {mediaList.length} Media Records Available
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
            <Card
              key={m.mediaId}
              hover
              onClick={() => setActiveMedia(m)}
              className="overflow-hidden flex flex-col justify-between cursor-pointer border-slate-200 hover:border-teal-700 group transition-all"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
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
                <div className="absolute top-2 left-2">
                  <Badge variant={m.region.toLowerCase()}>{m.region}</Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  {m.type === 'video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                  <span className="capitalize">{m.type}</span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-teal-800 uppercase tracking-wide">
                    {m.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5 group-hover:text-teal-800 transition-colors">
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

      {/* Lightbox / High-Res Preview Modal */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[55vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={activeMedia.url}
                alt={activeMedia.title}
                referrerPolicy="no-referrer"
                className="max-h-[55vh] w-auto object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => setActiveMedia(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3">
                <Badge variant={activeMedia.region?.toLowerCase()}>{activeMedia.region}</Badge>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest">
                  {activeMedia.category} • {activeMedia.stationName || activeMedia.region}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {activeMedia.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeMedia.caption}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Photo Credit</span>
                  <span className="font-semibold text-slate-700">{activeMedia.credit}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">License</span>
                  <span className="font-semibold text-slate-700">{activeMedia.license || 'GODL-India'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Catalog Identifier</span>
                  <span className="font-mono text-slate-700">{activeMedia.mediaId}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <a
                  href={activeMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full-Resolution Source</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMedia(null)}
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

export default MediaPage;
