import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Calendar, MapPin, ShieldCheck, ChevronRight, Upload, Download } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export const PublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await api.get('/publications', {
          params: { region: selectedRegion, domain: selectedDomain }
        });
        setPublications(response.data.data || []);
      } catch (err) {
        console.error('Failed to load publications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, [selectedRegion, selectedDomain]);

  const regions = ['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];
  const domains = ['All', 'Cryosphere', 'Atmosphere', 'Oceanography', 'Biology', 'Geophysics', 'Climate Science'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1">
            Peer-Reviewed Scientific Output
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Polar Research Publications
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            High-impact papers and peer-reviewed journals published by Indian scientists based on in-situ observations at Maitri, Bharati, Himadri, and Himansh.
          </p>
        </div>

        <Link
          to="/upload-research"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Your Research</span>
        </Link>
      </div>

      {/* Filters */}
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
          {publications.length} Articles Indexed
        </span>
      </div>

      {/* Publications Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-4">
          {publications.map((pub) => (
            <Card key={pub.publicationId} hover className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={pub.region.toLowerCase()}>{pub.region}</Badge>
                  <Badge variant="publication">{pub.scienceDomain}</Badge>
                  <span className="text-xs font-mono text-slate-500">{pub.journal} ({pub.year})</span>
                  <Badge variant="verified">Verified Citation</Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {pub.abstract}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>Authors: <strong className="text-slate-700">{pub.authors?.join(', ')}</strong></span>
                  {pub.volume && <span>Vol: {pub.volume} (pp. {pub.pages})</span>}
                  <span className="font-mono text-blue-600">DOI: {pub.doi}</span>
                </div>
              </div>

              {/* Action Buttons: [View Source] [DOI] [PDF] */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                {pub.fileUrl && (
                  <a
                    href={pub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="sm" className="text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1" icon={Download}>
                      PDF
                    </Button>
                  </a>
                )}

                <a
                  href={pub.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs flex items-center gap-1" icon={ExternalLink}>
                    DOI
                  </Button>
                </a>

                <a
                  href={pub.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm" className="text-xs">
                    View Source
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

export default PublicationsPage;
