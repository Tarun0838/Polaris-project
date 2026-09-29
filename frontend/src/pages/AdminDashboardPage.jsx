import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Database,
  FileText,
  BookOpen,
  Layers,
  Plus,
  Send,
  ExternalLink,
  Activity,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false);

  // New Resource Form
  const [resourceType, setResourceType] = useState('ResearchProject');
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    shortDescription: '',
    description: '',
    region: 'Antarctica',
    scienceDomain: 'Cryosphere',
    year: 2024,
    stationId: 'maitri',
    stationName: 'Maitri',
    expeditionId: 'isea-43',
    expeditionName: '43rd Indian Scientific Expedition to Antarctica',
    leadResearcher: { name: 'Dr. Scientist', institute: 'NCPOR' },
    sourceUrl: 'https://npdc.ncpor.res.in'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, draftsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/content?status=in_review')
      ]);
      setStats(statsRes.data.data);
      setPendingDrafts(draftsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      toast.error('Failed to load admin telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (decision) => {
    if (!selectedDraft) return;
    try {
      await api.patch(`/content/${selectedDraft._id}/review`, {
        decision,
        reviewComment: reviewComment || (decision === 'approved' ? 'Verified against official scientific baseline.' : 'Requires factual revision.')
      });
      toast.success(`Draft successfully ${decision}!`);
      setSelectedDraft(null);
      setReviewComment('');
      fetchDashboardData();
    } catch (err) {
      toast.error('Review submission failed.');
    }
  };

  const handlePublishDirect = async (draftId) => {
    try {
      await api.patch(`/content/${draftId}/publish`);
      toast.success('Content published to Public Outreach Portal!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Publishing failed.');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/resources', {
        resourceType,
        data: formData
      });
      toast.success(`New ${resourceType} added and verified in POLARIS!`);
      setAddResourceModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to create resource.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-28 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-28 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-28 bg-slate-200 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const counts = stats?.counts || {};
  const charts = stats?.charts || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Administrative & Curation Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            POLARIS Operations Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Ministry of Earth Sciences curation portal for resource metadata oversight, analytics, and human review loop for AI outreach.
          </p>
        </div>

        <Button
          variant="polar"
          size="md"
          icon={Plus}
          onClick={() => setAddResourceModalOpen(true)}
        >
          Add Verified Resource
        </Button>
      </div>

      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-900 font-heading">{counts.totalResources || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Total Resources</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-600 font-heading">{counts.totalProjects || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Research Projects</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-sky-600 font-heading">{counts.totalDatasets || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">NPDC Datasets</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-600 font-heading">{counts.totalReports || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">Technical Reports</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-teal-600 font-heading">{counts.totalPublications || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">DOI Publications</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-700 font-heading">{counts.pendingAiReviews || 0}</div>
          <div className="text-[11px] text-amber-800 font-bold">Pending Reviews</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-700 font-heading">{counts.publishedContent || 0}</div>
          <div className="text-[11px] text-emerald-800 font-bold">Published Live</div>
        </div>
      </div>

      {/* 2. HUMAN CURATION QUEUE (CRITICAL REQUIREMENT) */}
      <Card className="p-6 space-y-4 border-amber-300 bg-amber-50/20">
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 font-heading">
              AI Outreach Curation Queue (Pending Human Verification)
            </h2>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
            {pendingDrafts.length} Awaiting Curator Action
          </span>
        </div>

        {pendingDrafts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            ✅ No outreach drafts currently pending review. All drafts processed.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDrafts.map((draft) => (
              <div
                key={draft._id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="in_review">In Review</Badge>
                    <span className="text-xs font-semibold text-slate-700">{draft.contentType}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Audience: <strong>{draft.audience}</strong></span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {draft.title}
                  </h4>
                  <div className="text-xs text-slate-500">
                    Source: <strong className="text-slate-700">{draft.projectTitle}</strong> (ID: {draft.projectId})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedDraft(draft);
                      setReviewComment('');
                    }}
                  >
                    Audit & Verify Draft
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={Check}
                    onClick={() => handlePublishDirect(draft._id)}
                  >
                    Quick Publish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. RECHARTS ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Resources by Type */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Resources by Collection Type
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.resourcesByType || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#1e3e62" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Resources by Region */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Scientific Activity by Polar Region
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.resourcesByRegion || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.resourcesByRegion || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0284c7'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Research by Science Domain */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Research Projects by Scientific Domain
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.researchByDomain || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Content Publishing Workflow Status */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            AI Outreach Curation Pipeline Status
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.publishingStatus || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 4. RECENT AUDIT ACTIVITIES STREAM */}
      <Card className="p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Recent Institutional Audit Trail
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {stats?.recentActivities?.map((act) => (
            <div key={act._id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">{act.action}</span>
                <span className="text-slate-400"> — </span>
                <span className="text-slate-600">{act.targetTitle}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                By {act.actorName} ({act.actorRole})
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL: Audit & Verify Selected AI Draft */}
      <Modal
        isOpen={!!selectedDraft}
        onClose={() => setSelectedDraft(null)}
        title="Curator Verification & Editorial Decision"
        maxWidth="max-w-3xl"
      >
        {selectedDraft && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <div className="text-xs text-slate-500">
                Grounded Research Source: <strong>{selectedDraft.projectTitle}</strong> ({selectedDraft.projectId})
              </div>
              <div className="text-xs text-slate-500">
                Audience: <strong>{selectedDraft.audience}</strong> • Format: {selectedDraft.contentType}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{selectedDraft.title}</h4>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line text-slate-700">
                {selectedDraft.content}
              </div>
            </div>

            {/* Source References Checked */}
            <div>
              <h5 className="font-bold text-slate-800 text-xs uppercase mb-1">
                Verified Grounding Citations ({selectedDraft.sourceReferences?.length || 0})
              </h5>
              <div className="space-y-1">
                {selectedDraft.sourceReferences?.map((s, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs flex justify-between">
                    <span>{s.title} ({s.type})</span>
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-blue-600 font-mono underline">
                      {s.identifier}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Curator Comment Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Curator Editorial Feedback / Verification Note:
              </label>
              <textarea
                rows={2}
                placeholder="E.g., Verified against official NPDC in-situ records. Scientific conclusions accurate."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-xs focus:outline-hidden"
              />
            </div>

            {/* Decision Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => handleReviewAction('rejected')}
              >
                Reject & Send for Revision
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleReviewAction('approved')}
              >
                Approve & Publish to Outreach
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Add Verified Resource */}
      <Modal
        isOpen={addResourceModalOpen}
        onClose={() => setAddResourceModalOpen(false)}
        title="Add Verified Polar Scientific Resource"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateResource} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Resource Type</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2"
            >
              <option value="ResearchProject">Research Project</option>
              <option value="Dataset">Dataset (NPDC)</option>
              <option value="Report">Technical Report</option>
              <option value="Publication">Publication</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Identifier Code</label>
              <input
                type="text"
                placeholder="e.g., POL-PRJ-2024-07"
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2"
              >
                <option value="Antarctica">Antarctica</option>
                <option value="Arctic">Arctic</option>
                <option value="Himalaya">Himalaya</option>
                <option value="Southern Ocean">Southern Ocean</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Title</label>
            <input
              type="text"
              placeholder="Full scientific record title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Summary / Description</label>
            <textarea
              rows={3}
              required
              placeholder="Verified metadata description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value, shortDescription: e.target.value.slice(0, 100) })}
              className="w-full border border-slate-300 rounded-md p-2"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setAddResourceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="polar" size="sm" type="submit">
              Save & Verify in Repository
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
