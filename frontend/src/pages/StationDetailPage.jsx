import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Layers,
  Database,
  FileText,
  BookOpen,
  Ship,
  ExternalLink,
  ShieldCheck,
  Compass,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const StationDetailPage = () => {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchStation = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/stations/${id}`);
        setStation(response.data.data);
      } catch (err) {
        console.error('Failed to load station details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStation();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Station Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested polar base could not be located in official records.</p>
        <Link to="/map">
          <Button variant="secondary" size="sm">Back to Map</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'about', label: 'About Station' },
    { id: 'research', label: `Research Projects (${station.stats?.researchCount || 0})` },
    { id: 'datasets', label: `Datasets (${station.stats?.datasetCount || 0})` },
    { id: 'reports', label: `Technical Reports (${station.stats?.reportCount || 0})` },
    { id: 'publications', label: `Publications (${station.stats?.pubCount || 0})` },
    { id: 'expeditions', label: `Expeditions (${station.stats?.expCount || 0})` },
    { id: 'media', label: `Photographic Archive` }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/map" className="hover:text-blue-600">Polar Stations</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{station.name}</span>
      </div>

      {/* Hero Station Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white min-h-[280px] flex flex-col justify-end p-6 sm:p-10 shadow-lg">
        {/* Background Image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={station.heroImage}
            alt={station.name}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={station.region.toLowerCase()}>{station.region}</Badge>
            <Badge variant="official">Official NCPOR Station</Badge>
            <span className="text-xs font-mono text-cyan-300">Est. {station.establishedYear}</span>
            <span className="text-xs font-mono text-slate-300">• {station.operationalStatus}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight">
            {station.name} Station
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {station.location} ({station.coordinates.lat}°, {station.coordinates.lng}°) • {station.altitude}
          </p>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-600 font-heading">{station.stats?.researchCount || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Research Projects</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-sky-600 font-heading">{station.stats?.datasetCount || 0}</div>
          <div className="text-xs text-slate-500 font-medium">NPDC Datasets</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-600 font-heading">{station.stats?.reportCount || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Reports</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-teal-600 font-heading">{station.stats?.pubCount || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Publications</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl font-extrabold text-indigo-600 font-heading">{station.stats?.expCount || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Expeditions</div>
        </div>
      </div>

      {/* Clean Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
              activeTab === t.id
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: About Station */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Overview & Strategic Mandate</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {station.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Scientific Domains & Focus
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {station.scienceFocus?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Key Station Laboratories & Infrastructure
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {station.facilities?.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Right Column: Provenance & Technical Metadata */}
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Official Provenance
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Source Type</span>
                  <span className="font-medium text-slate-700">Official NPDC</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Verification</span>
                  <Badge variant="verified">Verified</Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Winter Capacity</span>
                  <span className="font-medium text-slate-700">{station.capacity?.winter} personnel</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Summer Capacity</span>
                  <span className="font-medium text-slate-700">{station.capacity?.summer} personnel</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={station.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs" icon={ExternalLink}>
                    View Official NCPOR Page
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Research Projects */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          {station.related?.projects?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
              No research projects currently registered for this station.
            </div>
          ) : (
            station.related?.projects?.map((p) => (
              <Card key={p.projectId} hover className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="project">{p.scienceDomain}</Badge>
                    <span className="text-xs font-mono text-slate-400">{p.year}</span>
                  </div>
                  <Link to={`/research/${p.projectId}`}>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {p.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1">{p.shortDescription}</p>
                </div>
                <Link to={`/research/${p.projectId}`} className="shrink-0">
                  <Button variant="secondary" size="sm" className="text-xs">
                    View Knowledge Graph →
                  </Button>
                </Link>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Datasets */}
      {activeTab === 'datasets' && (
        <div className="space-y-4">
          {station.related?.datasets?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
              No datasets registered for this station.
            </div>
          ) : (
            station.related?.datasets?.map((d) => (
              <Card key={d.datasetId} hover className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="dataset">NPDC Dataset</Badge>
                    <Badge variant={d.accessType === 'Open Access' ? 'open-access' : 'request-data'}>
                      {d.accessType}
                    </Badge>
                  </div>
                  <Link to={`/datasets/${d.datasetId}`}>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {d.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1">{d.description}</p>
                </div>
                <Link to={`/datasets/${d.datasetId}`} className="shrink-0">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Dataset Details →
                  </Button>
                </Link>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {station.related?.reports?.map((r) => (
            <Card key={r.reportId} hover className="p-4 flex items-center justify-between">
              <div>
                <Badge variant="report">{r.reportType}</Badge>
                <Link to={`/reports/${r.reportId}`}>
                  <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1">
                    {r.title}
                  </h4>
                </Link>
                <div className="text-xs text-slate-500 mt-1">{r.authoringBody} • {r.year}</div>
              </div>
              <Link to={`/reports/${r.reportId}`}>
                <Button variant="secondary" size="sm">View Report</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 5: Publications */}
      {activeTab === 'publications' && (
        <div className="space-y-4">
          {station.related?.publications?.map((pub) => (
            <Card key={pub.publicationId} hover className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="publication">DOI Paper</Badge>
                  <span className="text-xs font-mono text-slate-500">{pub.journal} ({pub.year})</span>
                </div>
                <Link to={`/publications/${pub.publicationId}`}>
                  <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {pub.title}
                  </h4>
                </Link>
                <div className="text-xs text-slate-500">
                  Authors: {pub.authors?.join(', ')}
                </div>
              </div>
              <Link to={`/publications/${pub.publicationId}`}>
                <Button variant="secondary" size="sm">View Citation</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 6: Expeditions */}
      {activeTab === 'expeditions' && (
        <div className="space-y-4">
          {station.related?.expeditions?.map((e) => (
            <Card key={e.expeditionId} hover className="p-4 flex items-center justify-between">
              <div>
                <Badge variant="southern ocean">{e.year}</Badge>
                <Link to={`/expeditions/${e.expeditionId}`}>
                  <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1">
                    {e.name}
                  </h4>
                </Link>
                <p className="text-xs text-slate-500 line-clamp-1">{e.summary}</p>
              </div>
              <Link to={`/expeditions/${e.expeditionId}`}>
                <Button variant="secondary" size="sm">Timeline</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 7: Media */}
      {activeTab === 'media' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {station.related?.media?.map((m) => (
            <Card key={m.mediaId} hover className="overflow-hidden">
              <img src={m.url} alt={m.title} className="w-full h-44 object-cover" />
              <div className="p-3 space-y-1">
                <div className="font-semibold text-xs text-slate-800">{m.title}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{m.caption}</p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">Credit: {m.credit}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StationDetailPage;
