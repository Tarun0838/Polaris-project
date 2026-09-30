import React, { useState, useEffect } from 'react';
import {
  FileText,
  Database,
  TrendingUp,
  Copy,
  Check,
  Download,
  Clock,
  BookOpen,
  Layers,
  ExternalLink,
  ShieldCheck,
  X,
  AlertCircle,
  RefreshCw,
  Ship,
  MapPin,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import Badge from './ui/Badge';
import Button from './ui/Button';

export const ExpeditionSynthesisModal = ({ isOpen, onClose, expeditionId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [synthesis, setSynthesis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !expeditionId) return;

    let isMounted = true;
    const fetchSynthesis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/expeditions/${expeditionId}/synthesize`);
        if (isMounted) {
          setSynthesis(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load expedition synthesis:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load expedition report. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSynthesis();

    return () => {
      isMounted = false;
    };
  }, [isOpen, expeditionId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopy = () => {
    if (!synthesis?.fullReportMarkdown) return;
    navigator.clipboard.writeText(synthesis.fullReportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!synthesis?.fullReportMarkdown) return;
    const blob = new Blob([synthesis.fullReportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${expeditionId}-expedition-report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Subtle Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full max-w-5xl border border-slate-300 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Institutional Header */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 border-t-4 border-blue-900">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 text-left">
                {/* Government Hierarchy Label */}
                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  <span>Ministry of Earth Sciences</span>
                  <span className="text-slate-300">•</span>
                  <span>National Centre for Polar and Ocean Research</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                    {synthesis ? synthesis.expeditionName : 'Consolidated Expedition Report'}
                  </h2>
                  {synthesis && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      REF: {synthesis.expeditionId.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                  <span>Season: <strong>{synthesis?.year || '—'}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Region: <strong>{synthesis?.region || '—'}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Vessel: <strong>{synthesis?.vessel || '—'}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    Verified Official Record
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close report"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Institutional Key Metrics Strip */}
          {synthesis && (
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reports Ingested</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {synthesis.missionMetrics.reportsCount}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">({synthesis.missionMetrics.totalPagesRead} pgs)</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">NPDC Datasets</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {synthesis.missionMetrics.datasetsCount}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">Streams</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scientific Findings</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {synthesis.whatWasFound.length}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">Recorded</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Observed Shifts</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {synthesis.whatChanged.length}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">Documented</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Personnel Deployed</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {synthesis.missionMetrics.participants}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">Complement</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Editorial Tabs & Export Toolbar */}
          <div className="flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-wrap gap-2">
            <div className="flex items-center gap-1 overflow-x-auto text-xs py-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Executive Summary</span>
              </button>

              <button
                onClick={() => setActiveTab('found')}
                className={`py-3 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'found'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Scientific Findings ({synthesis?.whatWasFound?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('changed')}
                className={`py-3 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'changed'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Observed Shifts ({synthesis?.whatChanged?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-3 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'timeline'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Voyage Chronology</span>
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                className={`py-3 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'sources'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Reports & Datasets ({synthesis?.sourcesIngested?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('markdown')}
                className={`py-3 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'markdown'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Full Document (.md)</span>
              </button>
            </div>

            {/* Document Action Buttons */}
            {synthesis && (
              <div className="flex items-center gap-2 py-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download (.md)</span>
                </Button>
              </div>
            )}
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-left bg-white">
            {loading && (
              <div className="py-16 text-center space-y-3">
                <div className="inline-flex p-3 bg-slate-100 text-slate-600 rounded-full animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900">Compiling Consolidated Expedition Report</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Reading connected technical reports, querying NPDC repositories, and extracting scientific measurements...
                  </p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="py-12 text-center space-y-3">
                <div className="inline-flex p-3 bg-rose-50 text-rose-600 rounded-full">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Unable to Compile Report</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const fetchSynthesis = async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        const response = await api.get(`/expeditions/${expeditionId}/synthesize`);
                        setSynthesis(response.data.data);
                      } catch (err) {
                        setError(err.response?.data?.message || 'Synthesis failed.');
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchSynthesis();
                  }}
                >
                  Retry
                </Button>
              </div>
            )}

            {synthesis && !loading && (
              <>
                {/* TAB 1: EXECUTIVE OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Synthesis Narrative */}
                    <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Executive Summary & Mandate
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Source: NCPOR Mission Proceedings
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {synthesis.executiveSummary}
                      </div>
                    </div>

                    {/* Mission Parameters Table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Operational & Field Parameters
                      </div>

                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Expedition Leader</span>
                          <span className="sm:col-span-2 font-semibold text-slate-900">
                            {synthesis.leader?.name || 'Chief Mission Scientist'} ({synthesis.leader?.designation || 'NCPOR'})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Logistics & Vessel</span>
                          <span className="sm:col-span-2 font-semibold text-slate-900">
                            {synthesis.vessel || 'Dedicated Polar Research Vessel'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Voyage Duration</span>
                          <span className="sm:col-span-2 font-semibold text-slate-900">
                            {synthesis.startDate} to {synthesis.endDate}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Operating Base / Corridor</span>
                          <span className="sm:col-span-2 font-semibold text-slate-900">
                            {synthesis.stations?.join(', ') || 'Oceanographic Transect Corridor'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Associated Data Streams</span>
                          <span className="sm:col-span-2 text-slate-800">
                            {synthesis.missionMetrics.datasetsCount} NPDC In-Situ Datasets • {synthesis.missionMetrics.reportsCount} Technical Volumes ({synthesis.missionMetrics.totalPagesRead} Pages) • {synthesis.missionMetrics.publicationsCount} Peer-Reviewed Articles
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Official Document Note */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        This report compiles verified metadata, observational datasets, and technical volumes maintained by the Ministry of Earth Sciences (MoES) and National Polar Data Centre (NPDC). Original raw files and source links are cataloged under the <strong>Reports & Datasets</strong> tab.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: SCIENTIFIC FINDINGS */}
                {activeTab === 'found' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Documented Scientific Discoveries & Measurements ({synthesis.whatWasFound.length})
                      </span>
                      <span className="text-[11px] text-slate-500">Source: NPDC Data Archives</span>
                    </div>

                    <div className="space-y-3">
                      {synthesis.whatWasFound.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {item.category}
                              </span>
                              <span className="text-xs font-mono text-slate-400">Item #{idx + 1}</span>
                            </div>

                            {item.sourceUrl && (
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1"
                              >
                                <span>Ref: {item.sourceReference}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">
                            {item.headline}
                          </h4>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.details}
                          </p>

                          {item.keyMetrics && item.keyMetrics.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
                              {item.keyMetrics.map((metric, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 font-mono border border-slate-200"
                                >
                                  {metric}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: OBSERVED SHIFTS */}
                {activeTab === 'changed' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Environmental & Baseline Changes Recorded ({synthesis.whatChanged.length})
                      </span>
                      <span className="text-[11px] text-slate-500">Benchmarked Against Historical Baseline</span>
                    </div>

                    <div className="space-y-3">
                      {synthesis.whatChanged.map((change, idx) => (
                        <div
                          key={change.id || idx}
                          className="border border-slate-200 rounded-lg p-4 bg-white space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {change.topic}
                            </h4>
                            {change.sourceUrl && (
                              <a
                                href={change.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1"
                              >
                                <span>Source: {change.sourceReference}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
                              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                Observed State
                              </div>
                              <p className="text-slate-800 leading-relaxed">
                                {change.observation}
                              </p>
                            </div>

                            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
                              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                Historical Baseline
                              </div>
                              <p className="text-slate-800 leading-relaxed">
                                {change.baselineComparison}
                              </p>
                            </div>

                            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
                              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                Environmental Implication
                              </div>
                              <p className="text-slate-800 leading-relaxed">
                                {change.environmentalImplication}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: VOYAGE CHRONOLOGY */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Operational & Field Science Milestones
                      </span>
                      <span className="text-[11px] text-slate-500">Official Expedition Log</span>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-5 bg-white">
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {synthesis.timelineSummary.map((step, idx) => (
                          <div key={idx} className="relative">
                            {/* Circle Marker */}
                            <div
                              className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                                step.milestone ? 'bg-blue-900 ring-2 ring-blue-100' : 'bg-slate-400'
                              }`}
                            />

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-900">
                                {step.date}
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {step.phase}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                              {step.title}
                            </h4>

                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-3xl">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: REPORTS & DATA INVENTORY */}
                {activeTab === 'sources' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Original Raw Data & Technical Reports Ingested ({synthesis.sourcesIngested.length})
                      </span>
                      <span className="text-[11px] text-slate-500">Verified Repository Citations</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {synthesis.sourcesIngested.map((src, idx) => (
                        <div
                          key={src.id || idx}
                          className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between space-y-2.5 hover:border-slate-300 transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {src.type}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">{src.volume}</span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {src.title}
                            </h4>

                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              <div><strong>Author / Source:</strong> {src.author}</div>
                              <div><strong>Identifier:</strong> <code className="text-slate-700 font-mono">{src.id}</code></div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500">{src.category}</span>
                            {src.url && src.url !== '#' ? (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                              >
                                <span>View Document</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Official Archive</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: FULL MARKDOWN DOSSIER */}
                {activeTab === 'markdown' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Complete Technical Document ({synthesis.fullReportMarkdown.length} Characters)
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={handleCopy} className="text-xs">
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleDownload} className="text-xs bg-slate-900 text-white">
                          Download .md
                        </Button>
                      </div>
                    </div>

                    <div className="bg-slate-50 text-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-[55vh] border border-slate-200 leading-relaxed">
                      <pre className="whitespace-pre-wrap">{synthesis.fullReportMarkdown}</pre>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Institutional Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>MoES / NCPOR Verified Scientific Protocol</span>
            </div>

            <Button variant="secondary" size="sm" onClick={onClose} className="border border-slate-300">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionSynthesisModal;
