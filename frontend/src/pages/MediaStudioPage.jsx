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
  Clock,
  Layers,
  Info,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  Share2,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  RefreshCw,
  X,
  Eye,
  Filter,
  ArrowRight,
  Globe,
  Camera
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const MediaStudioPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedProjectId = searchParams.get('projectId') || '';
  const { user } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(preSelectedProjectId);
  const [selectedAudience, setSelectedAudience] = useState('General Public');
  const [selectedContentType, setSelectedContentType] = useState('Social Media Post');

  // Chosen photo for draft
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [photoFilterRegion, setPhotoFilterRegion] = useState('All');

  // Generator & draft state
  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState('social'); // 'social' | 'article'
  const [copied, setCopied] = useState(false);

  // Editable fields
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftKeyFacts, setDraftKeyFacts] = useState([]);
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [draftImageCaption, setDraftImageCaption] = useState('');
  const [draftImageCredit, setDraftImageCredit] = useState('');

  // 1. Load initial repository projects, media library, and existing drafts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, mediaRes, contentRes] = await Promise.all([
          api.get('/projects'),
          api.get('/media'),
          api.get('/content')
        ]);

        const projs = projRes.data.data || [];
        const medias = mediaRes.data.data || [];
        const drafts = contentRes.data.data || [];

        setProjects(projs);
        setMediaLibrary(medias);
        setRecentDrafts(drafts.slice(0, 6));

        const defaultProjId = preSelectedProjectId || (projs.length > 0 ? projs[0].projectId : '');
        if (defaultProjId) {
          setSelectedProjectId(defaultProjId);
          autoSelectPhotoForProject(defaultProjId, projs, medias);
        }
      } catch (err) {
        console.error('Failed to load initial studio data:', err);
      }
    };
    fetchData();
  }, [preSelectedProjectId]);

  // Helper to pick the most relevant photo for a project
  const autoSelectPhotoForProject = (projId, projsList = projects, mediasList = mediaLibrary) => {
    const proj = projsList.find(p => p.projectId === projId);
    if (!proj) return;

    // 1. Try direct match on project
    let matched = mediasList.find(m => m.projectId === proj.projectId && m.type === 'image');
    // 2. Try match on station
    if (!matched && proj.stationId) {
      matched = mediasList.find(m => m.stationId === proj.stationId && m.type === 'image');
    }
    // 3. Try match on region
    if (!matched && proj.region) {
      matched = mediasList.find(m => m.region === proj.region && m.type === 'image');
    }

    if (matched) {
      setSelectedImage({
        url: matched.url,
        caption: matched.caption || matched.title,
        credit: matched.credit || 'MoES / NCPOR Archive',
        title: matched.title,
        region: matched.region
      });
    } else {
      setSelectedImage({
        url: '/stations/bharati.jpg',
        caption: 'Bharati Permanent Antarctic Station Facility',
        credit: 'MoES / NCPOR Photographic Archive',
        title: 'Bharati Station',
        region: 'Antarctica'
      });
    }
  };

  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    autoSelectPhotoForProject(projId);
  };

  const audiences = [
    'School Student',
    'College Student',
    'General Public',
    'Research Audience'
  ];

  const contentTypes = [
    'Social Media Post',
    'Website Article',
    'Simple Explanation',
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
        contentType: selectedContentType,
        imageUrl: selectedImage?.url,
        imageCaption: selectedImage?.caption,
        imageCredit: selectedImage?.credit
      });

      const draft = response.data.data;
      setGeneratedDraft(draft);
      setDraftTitle(draft.title);
      setDraftContent(draft.content);
      setDraftKeyFacts(draft.keyFacts || []);
      setDraftImageUrl(draft.imageUrl || selectedImage?.url || '/stations/bharati.jpg');
      setDraftImageCaption(draft.imageCaption || selectedImage?.caption || '');
      setDraftImageCredit(draft.imageCredit || selectedImage?.credit || 'MoES / NCPOR Archive');
      setIsEditing(false);

      // Auto switch preview mode based on format
      if (['Social Media Post', 'Image Caption'].includes(selectedContentType)) {
        setPreviewMode('social');
      } else {
        setPreviewMode('article');
      }

      // Refresh recent list
      const updatedList = await api.get('/content');
      setRecentDrafts((updatedList.data.data || []).slice(0, 6));

      if (response.data.isAiLive) {
        toast.success('Live AI Outreach Post generated with photo & verified citations!');
      } else {
        toast.success('Outreach Post Generated with Authentic Polar Photo!');
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
        keyFacts: draftKeyFacts,
        imageUrl: draftImageUrl,
        imageCaption: draftImageCaption,
        imageCredit: draftImageCredit
      });
      setGeneratedDraft(response.data.data);
      setIsEditing(false);
      toast.success('Post & media details saved successfully.');
    } catch (err) {
      toast.error('Failed to save draft changes.');
    }
  };

  const handleSubmitForReview = async () => {
    if (!generatedDraft) return;
    try {
      const response = await api.patch(`/content/${generatedDraft._id}/submit-review`);
      setGeneratedDraft(response.data.data);
      toast.success('Submitted to Polar Science Curator Review Queue!');
    } catch (err) {
      toast.error('Failed to submit for review.');
    }
  };

  const handleCopyPost = () => {
    if (!generatedDraft) return;
    const textToCopy = `📌 ${draftTitle}\n\n${draftContent}\n\nKey Facts:\n${draftKeyFacts.map(k => `• ${k}`).join('\n')}\n\n📸 Photo: ${draftImageCaption} (Credit: ${draftImageCredit})\nSource URL: ${draftImageUrl}\n\nGenerated by VYOM MoES / NCPOR Outreach Intelligence Engine`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Full post copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!generatedDraft) return;
    const mdContent = `# ${draftTitle}\n\n**Target Audience:** ${generatedDraft.audience}  \n**Format:** ${generatedDraft.contentType}  \n**Status:** ${generatedDraft.status}  \n\n![${draftImageCaption}](${draftImageUrl})\n*${draftImageCaption} (Credit: ${draftImageCredit})*\n\n## Key Scientific Findings\n${draftKeyFacts.map(f => `- ${f}`).join('\n')}\n\n## Content Body\n${draftContent}\n\n## Verified Data Citations\n${(generatedDraft.sourceReferences || []).map(s => `- [${s.title}](${s.url}) (${s.type})`).join('\n')}\n\n---\n*VYOM — Beyond Boundaries. Beyond Limits. — Ministry of Earth Sciences (MoES)*\n`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${generatedDraft.projectId || 'vyom'}_outreach_draft.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded draft as Markdown (.md)');
  };

  const selectedProjectObj = projects.find(p => p.projectId === selectedProjectId);

  // Filtered media for picker modal
  const filteredMedia = mediaLibrary.filter(m => {
    if (m.type !== 'image') return false;
    if (photoFilterRegion === 'All') return true;
    return (m.region || '').toLowerCase() === photoFilterRegion.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>VYOM AI Dissemination & Multimedia Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Media Studio: Research-to-Outreach Generator
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Synthesize verified polar research metadata into high-impact outreach posts with attached authentic photography, verified findings, and strict non-hallucinatory grounding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPhotoPickerOpen(true)}
            icon={ImageIcon}
          >
            Media Archive ({mediaLibrary.length})
          </Button>
          <Link to="/curator-queue">
            <Button variant="ghost" size="sm" icon={ShieldCheck}>
              Curator Review Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Controls vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 4-Step Generator Controls */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 space-y-6 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Outreach Parameters</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold border border-emerald-200">
                100% Grounded
              </span>
            </h2>

            {/* Step 1: Select Verified Research Source */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Step 1: Select Verified Research Source
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
              >
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    [{p.stationName}] {p.title}
                  </option>
                ))}
              </select>

              {selectedProjectObj && (
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-blue-950 line-clamp-1">{selectedProjectObj.title}</div>
                  <div className="text-slate-600 text-[11px] flex items-center gap-2">
                    <span>Station: <strong className="text-slate-900">{selectedProjectObj.stationName}</strong></span>
                    <span>•</span>
                    <span>Domain: <strong className="text-slate-900">{selectedProjectObj.scienceDomain}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Inclusion Card */}
            <div className="space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Attached Authentic Photo
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Change Photo
                </button>
              </div>

              {selectedImage ? (
                <div className="flex gap-3 items-center bg-white p-2 rounded-lg border border-slate-200">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || 'Polar Asset'}
                    className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                    onError={(e) => { e.target.src = '/stations/bharati.jpg'; }}
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {selectedImage.title || selectedImage.caption}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {selectedImage.caption}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                      Credit: {selectedImage.credit}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-2 text-center">
                  No image selected yet
                </div>
              )}
            </div>

            {/* Step 2: Select Audience */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Step 2: Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                {audiences.map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setSelectedAudience(aud)}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer ${
                      selectedAudience === aud
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
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
                className="w-full text-xs font-bold shadow-md cursor-pointer"
                icon={Sparkles}
              >
                {generating ? 'Synthesizing Verified Metadata & Media...' : 'Step 4: Generate Outreach Post'}
              </Button>
            </div>

            {/* Grounding Safety Notice */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>System Safety Grounding:</strong> VYOM strictly forbids hallucination. All generated text and citations are drawn directly from official MoES/NCPOR repository records and include authentic imagery.
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Generated Draft Preview & Review Flow */}
        <div className="lg:col-span-7 space-y-5">
          {generatedDraft ? (
            <Card className="p-6 sm:p-7 space-y-6 shadow-sm border border-slate-200 bg-white">
              {/* Header Status Bar & View Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={generatedDraft.status}>Status: {generatedDraft.status}</Badge>
                  <span className="text-xs font-medium text-slate-600">
                    For <strong>{generatedDraft.audience}</strong>
                  </span>
                </div>

                {/* Switcher & Actions */}
                <div className="flex items-center gap-2">
                  {/* View Switcher */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('social')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        previewMode === 'social' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Social View
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('article')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        previewMode === 'article' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Article View
                    </button>
                  </div>

                  {isEditing ? (
                    <Button variant="success" size="sm" onClick={handleSaveDraft} icon={Save}>
                      Save
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon={Edit3}>
                      Edit
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPost}
                    icon={copied ? Check : Copy}
                    title="Copy full post text & media link"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadMarkdown}
                    icon={Download}
                    title="Download as Markdown"
                  />
                </div>
              </div>

              {/* Requirement 24 Mandatory Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-amber-900 font-medium">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Generated from repository records — human curator verification required.</span>
                </div>
                {generatedDraft.status === 'draft' && (
                  <Button variant="polar" size="sm" onClick={handleSubmitForReview} icon={Send} className="text-[11px] py-1">
                    Submit to Review
                  </Button>
                )}
              </div>

              {/* PREVIEW MODE 1: SOCIAL MEDIA POST VIEW */}
              {previewMode === 'social' && !isEditing && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50/50 to-white shadow-xs space-y-4">
                  {/* Social Post Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        ❄️
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                          <span>VYOM Polar Science Outreach</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          National Centre for Polar and Ocean Research (MoES) • Just now
                        </div>
                      </div>
                    </div>
                    <Badge variant="blue">{generatedDraft.contentType}</Badge>
                  </div>

                  {/* Post Title */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {draftTitle}
                  </h3>

                  {/* Post Body */}
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {draftContent}
                  </div>

                  {/* Featured Photo with Station Overlay */}
                  {draftImageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-900 shadow-sm">
                      <img
                        src={draftImageUrl}
                        alt={draftImageCaption || 'Polar Research'}
                        className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-102"
                        onError={(e) => { e.target.src = '/stations/bharati.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-85" />
                      
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-xs font-semibold drop-shadow-sm flex items-center gap-1.5">
                          <Camera className="w-3 h-3 text-cyan-300" />
                          <span>{draftImageCaption || 'Field research operations'}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 mt-0.5">
                          Credit: {draftImageCredit || 'MoES / NCPOR Archive'}
                        </div>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-semibold border border-white/20">
                          Verified Media
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Key Verified Facts in Social Callout */}
                  {draftKeyFacts && draftKeyFacts.length > 0 && (
                    <div className="p-3 bg-cyan-50/70 border border-cyan-200/80 rounded-xl space-y-1.5">
                      <div className="text-[11px] font-bold text-cyan-950 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700" />
                        Key Verified Findings
                      </div>
                      <ul className="text-xs text-slate-700 space-y-1">
                        {draftKeyFacts.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-cyan-600 font-bold">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Social Engagement Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-slate-600 hover:text-blue-600 cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5" /> 142
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 hover:text-blue-600 cursor-pointer">
                        <MessageCircle className="w-3.5 h-3.5" /> 19
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 hover:text-blue-600 cursor-pointer">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPost}
                      className="text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Post Text & Image
                    </button>
                  </div>
                </div>
              )}

              {/* PREVIEW MODE 2: ARTICLE / EDITORIAL VIEW */}
              {previewMode === 'article' && !isEditing && (
                <div className="space-y-5">
                  {/* Article Hero Image */}
                  {draftImageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                      <img
                        src={draftImageUrl}
                        alt={draftImageCaption}
                        className="w-full h-80 object-cover"
                        onError={(e) => { e.target.src = '/stations/bharati.jpg'; }}
                      />
                      <div className="p-2.5 bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between">
                        <span>{draftImageCaption}</span>
                        <span className="text-[10px] text-slate-400">Credit: {draftImageCredit}</span>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl font-extrabold text-slate-900 font-heading leading-tight">
                    {draftTitle}
                  </h2>

                  {/* Key Verified Facts */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Key Verified Facts from Official Metadata
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
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-5 rounded-xl border border-slate-200">
                    {draftContent}
                  </div>
                </div>
              )}

              {/* EDITING MODE */}
              {isEditing && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Edit Outreach Draft & Media Settings
                  </div>

                  {/* Edit Title */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* Edit Photo Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Image URL / Station Photo
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={draftImageUrl}
                          onChange={(e) => setDraftImageUrl(e.target.value)}
                          className="w-full text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg p-2 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPhotoPickerOpen(true)}
                          className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                        >
                          Pick
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Photo Caption
                      </label>
                      <input
                        type="text"
                        value={draftImageCaption}
                        onChange={(e) => setDraftImageCaption(e.target.value)}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Edit Body */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Body Content</label>
                    <textarea
                      rows={8}
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full text-xs text-slate-800 font-mono bg-white border border-slate-300 rounded-lg p-3 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="success" size="sm" onClick={handleSaveDraft} icon={Save}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* Verified Sources Provenance Section */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Official Grounding Sources ({generatedDraft.sourceReferences?.length || 0})
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
            </Card>
          ) : (
            /* Empty State */
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Outreach Post Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Select a verified polar research project on the left, pick an audience, and click "Generate Outreach Post". The engine will pair it with an authentic polar photograph.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Polar Outreach Posts Gallery */}
      {recentDrafts && recentDrafts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Recently Generated Outreach Posts
              </h2>
              <p className="text-xs text-slate-500">
                Browse previously generated outreach materials with attached authentic media
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {recentDrafts.length} posts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentDrafts.map((d) => (
              <Card
                key={d._id}
                className="overflow-hidden hover:shadow-md transition-shadow border border-slate-200 cursor-pointer group"
                onClick={() => {
                  setGeneratedDraft(d);
                  setDraftTitle(d.title);
                  setDraftContent(d.content);
                  setDraftKeyFacts(d.keyFacts || []);
                  setDraftImageUrl(d.imageUrl || '/stations/bharati.jpg');
                  setDraftImageCaption(d.imageCaption || '');
                  setDraftImageCredit(d.imageCredit || '');
                  setIsEditing(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={d.imageUrl || '/stations/bharati.jpg'}
                    alt={d.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/stations/bharati.jpg'; }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant={d.status}>{d.status}</Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {d.contentType}
                  </div>
                </div>

                <CardBody className="p-4 space-y-2">
                  <div className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {d.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {d.content}
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                    <span>Audience: <strong>{d.audience}</strong></span>
                    <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                      Load Post <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* PHOTO PICKER MODAL */}
      {isPhotoPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Select Authentic Polar Photograph
                </h3>
                <p className="text-xs text-slate-500">
                  Choose from verified photography in the National Centre for Polar and Ocean Research archive
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Region Filter Tabs */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Region:
              </span>
              {['All', 'Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setPhotoFilterRegion(reg)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    photoFilterRegion === reg
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Grid of Photos */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((m) => (
                <div
                  key={m.mediaId}
                  onClick={() => {
                    setSelectedImage({
                      url: m.url,
                      caption: m.caption || m.title,
                      credit: m.credit || 'MoES Archive',
                      title: m.title,
                      region: m.region
                    });
                    if (isEditing) {
                      setDraftImageUrl(m.url);
                      setDraftImageCaption(m.caption || m.title);
                      setDraftImageCredit(m.credit || 'MoES Archive');
                    }
                    setIsPhotoPickerOpen(false);
                    toast.success(`Selected: ${m.title}`);
                  }}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-slate-900"
                >
                  <img
                    src={m.url}
                    alt={m.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/stations/bharati.jpg'; }}
                  />
                  <div className="p-2 bg-white text-left">
                    <div className="text-[11px] font-bold text-slate-900 truncate">
                      {m.title}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate mt-0.5">
                      {m.stationName || m.region}
                    </div>
                  </div>
                  <div className="absolute top-1.5 left-1.5">
                    <Badge variant={(m.region || '').toLowerCase()}>{m.region}</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredMedia.length} verified authentic media assets</span>
              <Button variant="outline" size="sm" onClick={() => setIsPhotoPickerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaStudioPage;
