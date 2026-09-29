import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  Layers,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const DatasetDetailPage = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/datasets/${id}`);
        setDataset(response.data.data);
      } catch (err) {
        console.error('Failed to load dataset details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();
  }, [id]);

  const copyCitation = () => {
    if (dataset?.citation) {
      navigator.clipboard.writeText(dataset.citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Dataset Record Not Found</h2>
        <Link to="/datasets">
          <Button variant="secondary" size="sm">Back to Datasets</Button>
        </Link>
      </div>
    );
  }

  const isRequestRequired = dataset.accessType === 'Request Data via NPDC';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/datasets" className="hover:text-blue-600">Datasets</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{dataset.datasetId}</span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={dataset.region.toLowerCase()}>{dataset.region}</Badge>
            <Badge variant="dataset">{dataset.scienceDomain}</Badge>
            <Badge variant="verified">OFFICIAL SOURCE</Badge>
            <Badge variant={isRequestRequired ? 'request-data' : 'open-access'}>
              {isRequestRequired ? 'REQUEST DATA' : 'GET DATA'}
            </Badge>
          </div>

          <div className="text-xs font-mono text-slate-400">
            NPDC ID: {dataset.datasetId}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
          {dataset.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          {dataset.description}
        </p>

        {/* Data Access Policy Alert */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
          isRequestRequired
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
        }`}>
          <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isRequestRequired ? 'text-amber-600' : 'text-emerald-600'}`} />
          <div className="space-y-1">
            <div className="font-bold">
              {isRequestRequired ? 'Access Notice: Regulated National Polar Data' : 'Open Access Dataset'}
            </div>
            <div>
              {dataset.officialNotice || 'Access through official NPDC source. User registration on National Polar Data Centre portal required.'}
            </div>
          </div>
        </div>

        {/* Direct Action Link to Official NPDC Source */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={dataset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="polar" size="md" icon={ExternalLink}>
              Open Official Source (NPDC Portal)
            </Button>
          </a>

          {dataset.affiliatedProject && (
            <Link to={`/research/${dataset.affiliatedProject.projectId}`}>
              <Button variant="secondary" size="md">
                View Connected Research Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Grid: Parameters & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Measured Variables & Parameters */}
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Measured Variables & Environmental Parameters
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {dataset.parameters?.map((param, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>{param}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Citation Card */}
          {dataset.citation && (
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Official Recommended Citation
                </h3>
                <button
                  onClick={copyCitation}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Citation'}
                </button>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 leading-relaxed">
                {dataset.citation}
              </div>
            </Card>
          )}

          {/* Connected Knowledge: Station, Expedition, Publications */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Connected Polar Knowledge Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Connected Station */}
              {dataset.stationName && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-blue-600">Connected Polar Station</div>
                  <div className="font-bold text-slate-800 text-sm">{dataset.stationName} Station</div>
                  <Link
                    to={`/stations/${dataset.stationId || dataset.stationName.toLowerCase()}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium pt-1"
                  >
                    <span>View Station Details</span>
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              )}

              {/* Connected Expedition */}
              {dataset.expeditionName && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-sky-600">Connected Expedition</div>
                  <div className="font-bold text-slate-800 text-sm">{dataset.expeditionName}</div>
                  {dataset.expeditionId && (
                    <Link
                      to={`/expeditions/${dataset.expeditionId}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium pt-1"
                    >
                      <span>View Expedition Mission</span>
                      <span className="ml-1">→</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Connected Publications */}
            {dataset.relatedPublications && dataset.relatedPublications.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Related Publications
                </div>
                <div className="space-y-2">
                  {dataset.relatedPublications.map((pub) => (
                    <div key={pub.publicationId} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{pub.title}</div>
                        <div className="text-slate-500">{pub.journal} ({pub.year}) • DOI: {pub.doi}</div>
                      </div>
                      <Link to={`/publications/${pub.publicationId}`} className="shrink-0 ml-2">
                        <Button variant="secondary" size="sm" className="text-xs">
                          Paper
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Metadata Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Dataset Technical Specs
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Data Format</span>
                <span className="font-semibold text-slate-800">{dataset.format}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">File Size</span>
                <span className="font-semibold text-slate-800">{dataset.fileSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Temporal Range</span>
                <span className="font-semibold text-slate-800">
                  {dataset.temporalCoverage?.start} to {dataset.temporalCoverage?.end}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Data Provider</span>
                <span className="font-semibold text-slate-800 text-right">{dataset.provider}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">License</span>
                <span className="font-semibold text-slate-800 text-right">{dataset.license}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Station</span>
                <span className="font-semibold text-slate-800">{dataset.stationName || 'Regional'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Badge variant="verified" className="w-full justify-center py-1">
                MoES Verified Provenance
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetailPage;
