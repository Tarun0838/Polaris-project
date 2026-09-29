import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Send,
  Save,
  Edit3,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const MediaStudioPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedProjectId = searchParams.get('projectId') || '';
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(preSelectedProjectId);
  const [selectedAudience, setSelectedAudience] = useState('School Student');
  const [selectedContentType, setSelectedContentType] = useState('Website Article');

  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftKeyFacts, setDraftKeyFacts] = useState([]);

  // Load all research projects for Step 1
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        const data = response.data.data || [];
        setProjects(data);
        if (!selectedProjectId && data.length > 0) {
          setSelectedProjectId(data[0].projectId);
        }
      } catch (err) {
        console.error('Failed to load projects in media studio:', err);
      }
    };
    fetchProjects();
  }, []);

  const audiences = [
    'School Student',
    'College Student',
    'General Public',
    'Research Audience'
  ];

  const contentTypes = [
    'Simple Explanation',
    'Website Article',
    'Social Media Post',
    'Image Caption',
    'Short Video Script',
    'Key Facts',
    'Educational Summary'
  ];

  const handleGenerate = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a verified research project source.');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/content/generate', {
        projectId: selectedProjectId,
        audience: selectedAudience,
        contentType: selectedContentType
      });

      const draft = response.data.data;
      setGeneratedDraft(draft);
      setDraftTitle(draft.title);
      setDraftContent(draft.content);
      setDraftKeyFacts(draft.keyFacts || []);
      setIsEditing(false);

      if (response.data.isAiLive) {
        toast.success('Live AI Draft generated with verified source context!');
      } else {
        toast.success('Demo Content Generation: Grounded strictly in official metadata.');
      }
    } catch (err) {
      console.error('Draft generation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to generate outreach draft.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedDraft) return;
    try {
      const response = await api.put(`/content/${generatedDraft._id}`, {
        title: draftTitle,
        content: draftContent,
        keyFacts: draftKeyFacts
      });
      setGeneratedDraft(response.data.data);
      setIsEditing(false);
      toast.success('Draft changes saved successfully.');
    } catch (err) {
      toast.error('Failed to save draft changes.');
    }
  };

  const handleSubmitForReview = async () => {
    if (!generatedDraft) return;
    try {
      const response = await api.patch(`/content/${generatedDraft._id}/submit-review`);
      setGeneratedDraft(response.data.data);
      toast.success('Draft submitted to Polar Science Curator Review Queue!');
    } catch (err) {
      toast.error('Failed to submit for review.');
    }
  };

  const selectedProjectObj = projects.find(p => p.projectId === selectedProjectId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>POLARIS AI Dissemination Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Media Studio: Research-to-Outreach Generator
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Translate verified polar research metadata into tailored outreach formats. All generated drafts are grounded strictly in official records and require human curator verification before publishing.
        </p>
      </div>

      {/* Main Grid: Controls vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 4-Step Generator Controls */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Outreach Parameters</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">
                Source Grounded
              </span>
            </h2>

            {/* Step 1: Select Verified Research Source */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Step 1: Select Verified Research Source
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
              >
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    [{p.stationName}] {p.title}
                  </option>
                ))}
              </select>

              {selectedProjectObj && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-blue-900 line-clamp-1">{selectedProjectObj.title}</div>
                  <div className="text-slate-500 text-[11px]">
                    Station: <strong>{selectedProjectObj.stationName}</strong> • Domain: {selectedProjectObj.scienceDomain}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select Audience */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Step 2: Select Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                {audiences.map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setSelectedAudience(aud)}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                      selectedAudience === aud
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Select Content Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Step 3: Desired Outreach Format
              </label>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                {contentTypes.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Step 4: Generate Draft Button */}
            <div className="pt-2">
              <Button
                variant="polar"
                size="lg"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full text-xs font-bold"
                icon={Sparkles}
              >
                {generating ? 'Synthesizing Verified Metadata...' : 'Step 4: Generate Outreach Draft'}
              </Button>
            </div>

            {/* Grounding Safety Notice */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>System Safety Constraint:</strong> POLARIS strictly forbids hallucination. The backend prompt enforces answers drawn solely from the selected project, linked datasets, and expedition reports.
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Generated Draft Preview & Review Flow */}
        <div className="lg:col-span-7 space-y-5">
          {generatedDraft ? (
            <Card className="p-6 sm:p-8 space-y-6">
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={generatedDraft.status}>Status: {generatedDraft.status}</Badge>
                  <span className="text-xs font-medium text-slate-500">
                    For <strong>{generatedDraft.audience}</strong> ({generatedDraft.contentType})
                  </span>
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Button variant="success" size="sm" onClick={handleSaveDraft} icon={Save}>
                      Save Changes
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon={Edit3}>
                      Edit Draft
                    </Button>
                  )}

                  {generatedDraft.status === 'draft' && (
                    <Button variant="polar" size="sm" onClick={handleSubmitForReview} icon={Send}>
                      Submit for Curator Review
                    </Button>
                  )}
                </div>
              </div>

              {/* Requirement 24 Mandatory Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Generated from repository records — human verification required.</span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Outreach Title
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-md p-2 focus:outline-hidden"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">
                    {draftTitle}
                  </h3>
                )}
              </div>

              {/* Key Verified Facts */}
              <div className="space-y-2 bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Verified Facts from Metadata
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {draftKeyFacts.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-1.5" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Body Content */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Grounded Content Body
                </span>
                {isEditing ? (
                  <textarea
                    rows={10}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full text-xs text-slate-800 font-mono border border-slate-300 rounded-md p-3 focus:outline-hidden"
                  />
                ) : (
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-100">
                    {draftContent}
                  </div>
                )}
              </div>

              {/* Verified Sources Provenance Section (CRITICAL REQUIREMENT) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Based On Verified Sources ({generatedDraft.sourceReferences?.length || 0})
                  </span>
                  <span className="text-[10px] text-slate-400">Strictly Non-Hallucinatory</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {generatedDraft.sourceReferences?.map((src, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800">{src.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {src.type} • ID: <span className="font-mono text-slate-700">{src.identifier}</span>
                        </div>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 shrink-0 ml-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Notice */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <strong>Human Curator Review Workflow:</strong> This draft is currently marked as{' '}
                  <span className="font-semibold uppercase text-slate-900">'{generatedDraft.status}'</span>.
                  {generatedDraft.status === 'in_review' && (
                    <span className="text-amber-700 block mt-0.5 font-medium">
                      Waiting for approval in Admin Curator Queue.
                    </span>
                  )}
                  {generatedDraft.status === 'published' && (
                    <span className="text-emerald-700 block mt-0.5 font-medium">
                      Published and live on the Public Outreach Dissemination Portal!
                    </span>
                  )}
                </div>

                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      Open Admin Review Queue →
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            /* Empty State */
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Outreach Draft Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Select a verified polar research project on the left, choose your target audience and content format, and click "Generate Outreach Draft".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaStudioPage;
