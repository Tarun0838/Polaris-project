import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Ship,
  User,
  Database,
  FileText,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Layers,
  ArrowRight,
  Share2,
  Info
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';

export const ResearchProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data.data);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <Link to="/research">
          <Button variant="secondary" size="sm">Back to Research</Button>
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
        <Link to="/research" className="hover:text-blue-600">Research Projects</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{project.projectId}</span>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={project.region.toLowerCase()}>{project.region}</Badge>
            <Badge variant="project">{project.scienceDomain}</Badge>
            <Badge variant="verified">Official Source Verified</Badge>
            <span className="text-xs font-mono text-slate-400">Reg: {project.projectId} ({project.year})</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={GraduationCap}
              onClick={() => setStudentModalOpen(true)}
              className="text-blue-700 border-blue-300 bg-blue-50/50 hover:bg-blue-100"
            >
              Explain for Students
            </Button>

            <Link to={`/media-studio?projectId=${project.projectId}`}>
              <Button variant="polar" size="sm" icon={Sparkles}>
                Create Outreach in Media Studio
              </Button>
            </Link>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
          {project.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          {project.description}
        </p>

        {/* Lead & Affiliation Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Principal Investigator</span>
            <span className="font-semibold text-slate-900">{project.leadResearcher?.name}</span>
            <span className="text-slate-500 block text-[11px]">{project.leadResearcher?.institute}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Station Hub</span>
            <Link to={`/stations/${project.stationId}`} className="font-semibold text-blue-600 hover:underline">
              📍 {project.stationName} Station
            </Link>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Expedition Mission</span>
            <Link to={`/expeditions/${project.expeditionId}`} className="font-semibold text-blue-600 hover:underline">
              🚢 {project.expeditionName}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KNOWLEDGE RELATIONSHIP VISUAL DIAGRAM (CRITICAL REQUIREMENT) */}
      <Card className="p-6 space-y-6 bg-slate-900 text-white border-slate-800 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-heading">
              Knowledge Relationship Architecture
            </h2>
          </div>
          <span className="text-xs text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            VYOM Relational Graph Layer
          </span>
        </div>

        {/* Visual Multi-tier Diagram */}
        <div className="space-y-6 py-2">
          {/* Tier 1: Core Research Project Node */}
          <div className="flex justify-center">
            <div className="bg-blue-600/30 border-2 border-cyan-400 rounded-xl p-4 max-w-lg text-center shadow-lg">
              <div className="text-[10px] text-cyan-300 uppercase tracking-widest font-mono">Central Research Project</div>
              <div className="font-bold text-sm text-white mt-0.5">{project.title}</div>
              <div className="text-[11px] text-slate-300 mt-1">Code: {project.projectId} • {project.scienceDomain}</div>
            </div>
          </div>

          {/* Connectors Down */}
          <div className="flex justify-center text-cyan-400 text-xs">
            <span>↓ Connected Operational Environment ↓</span>
          </div>

          {/* Tier 2: Station, Expedition, Lead Scientist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Operational Station</div>
              <Link to={`/stations/${project.stationId}`} className="text-xs font-bold text-cyan-300 hover:underline mt-1 block">
                📍 {project.stationName} ({project.region})
              </Link>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Scientific Expedition</div>
              <Link to={`/expeditions/${project.expeditionId}`} className="text-xs font-bold text-blue-300 hover:underline mt-1 block">
                🚢 {project.expeditionName}
              </Link>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Principal Investigator</div>
              <div className="text-xs font-bold text-slate-200 mt-1">
                👨‍🔬 {project.leadResearcher?.name}
              </div>
            </div>
          </div>

          {/* Connectors Down */}
          <div className="flex justify-center text-cyan-400 text-xs">
            <span>↓ Generated Scientific Products ↓</span>
          </div>

          {/* Tier 3: Datasets, Reports, Publications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/90 border border-sky-500/40 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-sky-400 uppercase font-bold">NPDC Datasets</span>
                <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded">
                  {project.datasets?.length || 0}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">In-situ calibrated measurements logged to National Polar Data Centre.</p>
            </div>

            <div className="bg-slate-800/90 border border-amber-500/40 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 uppercase font-bold">Technical Reports</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">
                  {project.reports?.length || 0}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Annual expedition and scientific synthesis documentation.</p>
            </div>

            <div className="bg-slate-800/90 border border-teal-500/40 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-teal-400 uppercase font-bold">Publications</span>
                <span className="text-[10px] bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded">
                  {project.publications?.length || 0}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Peer-reviewed international journals with cross-verified DOIs.</p>
            </div>
          </div>

          {/* Tier 4: Public Outreach & Educational Layer */}
          <div className="flex justify-center text-cyan-400 text-xs">
            <span>↓ Outreach & Dissemination Layer ↓</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200">
                Grounds AI outreach drafts in Media Studio and Student Learning modules.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStudentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold"
              >
                Explain for Students
              </button>
              <Link to={`/media-studio?projectId=${project.projectId}`}>
                <button className="bg-slate-700 hover:bg-slate-600 text-cyan-300 px-3 py-1 rounded text-xs font-semibold">
                  Generate Outreach
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. SCIENTIFIC FINDINGS & METHODOLOGY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Key Findings */}
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-heading">Key Scientific Findings</h3>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {project.keyFindings?.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{finding}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Methodology */}
          <Card className="p-6 space-y-2">
            <h3 className="text-base font-bold text-slate-900 font-heading">Observational Methodology</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {project.methodology}
            </p>
          </Card>

          {/* Connected Datasets */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              Connected NPDC Datasets ({project.datasets?.length || 0})
            </h3>

            {project.datasets?.map((d) => (
              <Card key={d.datasetId} hover className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="dataset">NPDC Dataset</Badge>
                    <Badge variant={d.accessType === 'Open Access' ? 'open-access' : 'request-data'}>
                      {d.accessType}
                    </Badge>
                  </div>
                  <Link to={`/datasets/${d.datasetId}`}>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1">
                      {d.title}
                    </h4>
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Format: {d.format} • Size: {d.fileSize}
                  </div>
                </div>
                <Link to={`/datasets/${d.datasetId}`}>
                  <Button variant="secondary" size="sm">Get Data</Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Connected Publications */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Connected Peer-Reviewed Publications ({project.publications?.length || 0})
            </h3>

            {project.publications?.map((pub) => (
              <Card key={pub.publicationId} hover className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <Badge variant="publication">Journal Paper</Badge>
                  <Link to={`/publications/${pub.publicationId}`}>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {pub.title}
                    </h4>
                  </Link>
                  <div className="text-xs text-slate-500">
                    {pub.journal} • DOI: <a href={pub.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{pub.doi}</a>
                  </div>
                </div>
                <Link to={`/publications/${pub.publicationId}`}>
                  <Button variant="secondary" size="sm">Details</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Collaborating Bodies & Metadata */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Project Governance
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-slate-800">{project.duration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Source Entity</span>
                <span className="font-semibold text-slate-800">{project.sourceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Verification</span>
                <Badge variant="verified">MoES Verified</Badge>
              </div>
            </div>

            <div className="pt-2">
              <h5 className="text-[11px] font-bold text-slate-600 uppercase mb-1">
                Collaborating Institutions
              </h5>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                {project.collaboratingInstitutes?.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full text-xs" icon={ExternalLink}>
                  Open NPDC Project Record
                </Button>
              </a>
            </div>
          </Card>

          {/* Quick Outreach Banner */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Dissemination Studio
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesize this research into educational articles, school explanations, or social media snapshots using verified metadata.
            </p>
            <Link to={`/media-studio?projectId=${project.projectId}`}>
              <Button variant="polar" size="sm" className="w-full text-xs">
                Launch Media Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. STUDENT EXPLANATION MODAL (STUDENT MODE) */}
      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title="Student Learning Mode — Simplified Scientific Explanation"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Badge & Source Grounding Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <strong>Source-Grounded Student Translation:</strong> This simplified summary is generated solely from verified research metadata for project <strong>{project.projectId}</strong> at <strong>{project.stationName} Station</strong>.
            </div>
          </div>

          {/* Simple Explanation */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Simple Explanation</h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {project.studentExplanation?.summary || project.shortDescription}
            </p>
          </div>

          {/* Why It Matters */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Why It Matters</h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {project.studentExplanation?.whyItMatters || 'Helps scientists understand global climate trends and preserve fragile polar ecosystems.'}
            </p>
          </div>

          {/* Key Concepts */}
          {project.studentExplanation?.keyConcepts && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Key Concepts to Learn</h4>
              <ul className="space-y-2">
                {project.studentExplanation.keyConcepts.map((concept, idx) => (
                  <li key={idx} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg text-xs leading-relaxed text-slate-700">
                    📌 {concept}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fun Fact */}
          {project.studentExplanation?.funFact && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
              <h5 className="font-bold text-cyan-950 text-xs mb-1">Polar Science Fun Fact</h5>
              <p className="text-xs text-cyan-900">{project.studentExplanation.funFact}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              Curated under MoES Smart Education initiative
            </span>
            <Button variant="secondary" size="sm" onClick={() => setStudentModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResearchProjectDetailPage;
