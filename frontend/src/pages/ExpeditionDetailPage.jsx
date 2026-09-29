import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Ship, Calendar, MapPin, Users, CheckCircle2, ChevronRight, ExternalLink, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const ExpeditionDetailPage = () => {
  const { id } = useParams();
  const [expedition, setExpedition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpedition = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/expeditions/${id}`);
        setExpedition(response.data.data);
      } catch (err) {
        console.error('Failed to load expedition detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpedition();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Expedition Record Not Found</h2>
        <Link to="/expeditions">
          <Button variant="secondary" size="sm">Back to Expeditions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/expeditions" className="hover:text-blue-600">Expeditions</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{expedition.shortName || expedition.name}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={expedition.region.toLowerCase()}>{expedition.region}</Badge>
          <Badge variant="official">Official NCPOR Mission</Badge>
          <span className="text-xs font-mono text-slate-500">{expedition.year}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading">
          {expedition.name}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          {expedition.summary}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Expedition Leader</span>
            <span className="font-semibold text-slate-800">{expedition.leader?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Vessel / Logistics</span>
            <span className="font-semibold text-slate-800">{expedition.vessel}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Duration</span>
            <span className="font-semibold text-slate-800">{expedition.startDate} to {expedition.endDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Participating Stations</span>
            <span className="font-semibold text-slate-800">{expedition.stations?.join(', ') || 'Oceanographic Cruise'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Objectives & Vertical Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Objectives & Affiliated Research */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading">Primary Mission Objectives</h3>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {expedition.objectives?.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Affiliated Research Projects */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Scientific Projects Executed Under Mission ({expedition.related?.projects?.length || 0})
            </h3>
            {expedition.related?.projects?.map((proj) => (
              <Card key={proj.projectId} hover className="p-4 flex items-center justify-between">
                <div>
                  <Badge variant="project">{proj.scienceDomain}</Badge>
                  <Link to={`/research/${proj.projectId}`}>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1">
                      {proj.title}
                    </h4>
                  </Link>
                  <div className="text-xs text-slate-500 mt-1">
                    Station: <strong>{proj.stationName}</strong> • PI: {proj.leadResearcher?.name}
                  </div>
                </div>
                <Link to={`/research/${proj.projectId}`}>
                  <Button variant="secondary" size="sm">Record</Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Connected Reports */}
          {expedition.related?.reports?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Expedition Technical Reports ({expedition.related.reports.length})
              </h3>
              {expedition.related.reports.map((rep) => (
                <Card key={rep.reportId} hover className="p-4 flex items-center justify-between">
                  <div>
                    <Badge variant="report">{rep.reportType}</Badge>
                    <Link to={`/reports/${rep.reportId}`}>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1">
                        {rep.title}
                      </h4>
                    </Link>
                    <div className="text-xs text-slate-500 mt-1">{rep.authoringBody} • {rep.year}</div>
                  </div>
                  <Link to={`/reports/${rep.reportId}`}>
                    <Button variant="secondary" size="sm">Report</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Connected Datasets */}
          {expedition.related?.datasets?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                NPDC In-Situ Datasets Collected ({expedition.related.datasets.length})
              </h3>
              {expedition.related.datasets.map((ds) => (
                <Card key={ds.datasetId} hover className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="dataset">NPDC Dataset</Badge>
                      <Badge variant={ds.accessType === 'Open Access' ? 'open-access' : 'request-data'}>
                        {ds.accessType}
                      </Badge>
                    </div>
                    <Link to={`/datasets/${ds.datasetId}`}>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1">
                        {ds.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-1">{ds.description}</p>
                  </div>
                  <Link to={`/datasets/${ds.datasetId}`}>
                    <Button variant="secondary" size="sm">Dataset</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Connected Publications */}
          {expedition.related?.publications?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Peer-Reviewed Publications ({expedition.related.publications.length})
              </h3>
              {expedition.related.publications.map((pub) => (
                <Card key={pub.publicationId} hover className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="publication">DOI Paper</Badge>
                      <span className="text-xs font-mono text-slate-500">{pub.journal} ({pub.year})</span>
                    </div>
                    <Link to={`/publications/${pub.publicationId}`}>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1">
                        {pub.title}
                      </h4>
                    </Link>
                    <div className="text-xs text-slate-500">Authors: {pub.authors?.join(', ')}</div>
                  </div>
                  <Link to={`/publications/${pub.publicationId}`}>
                    <Button variant="secondary" size="sm">Paper</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Connected Media */}
          {expedition.related?.media?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Expedition Photographic Documentation ({expedition.related.media.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expedition.related.media.map((med) => (
                  <Card key={med.mediaId} hover className="overflow-hidden">
                    <img src={med.url} alt={med.title} className="w-full h-36 object-cover" />
                    <div className="p-2.5">
                      <div className="font-semibold text-xs text-slate-800 line-clamp-1">{med.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Credit: {med.credit}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Participating Stations & Clean Vertical Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Participating Stations */}
          {expedition.stations?.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Participating Polar Stations
              </h3>
              <div className="space-y-2">
                {expedition.stations.map((stName) => (
                  <Link
                    key={stName}
                    to={`/stations/${stName.toLowerCase()}`}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs text-slate-800 group-hover:text-blue-700">{stName} Station</span>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Timeline Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Expedition Voyage Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {expedition.timeline?.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                    step.milestone ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-slate-400'
                  }`} />
                  <div className="text-[11px] font-mono text-blue-600 font-semibold">{step.date}</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{step.title}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionDetailPage;
