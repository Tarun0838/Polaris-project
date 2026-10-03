import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Upload,
  FileText,
  Database,
  Compass,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Download,
  AlertCircle,
  FileCheck,
  X,
  Layers,
  Calendar,
  MapPin,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const UploadResearchPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('publication'); // 'publication' | 'project' | 'dataset'
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { fileUrl, fileName, fileSize }
  const [dragActive, setDragActive] = useState(false);

  // My Submissions list
  const [mySubmissions, setMySubmissions] = useState({
    publications: [],
    projects: [],
    datasets: []
  });
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  // Publication Form State
  const [pubForm, setPubForm] = useState({
    title: '',
    authors: user?.name ? `${user.name}, NCPOR Polar Team` : 'Dr. Rohit Srivastava, Dr. M. Ravichandran',
    journal: 'Journal of Geophysical Research: Atmospheres',
    year: 2024,
    volume: '129',
    issue: '8',
    pages: 'e2024JD041289',
    doi: '10.1029/2024JD041289',
    region: 'Antarctica',
    scienceDomain: 'Cryosphere',
    stationId: 'maitri',
    stationName: 'Maitri',
    expeditionId: 'isea-43',
    abstract: '',
    sourceUrl: 'https://npdc.ncpor.res.in'
  });

  // Project Form State
  const [projForm, setProjForm] = useState({
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
    leadResearcherName: user?.name || 'Dr. Rohit Srivastava',
    institute: user?.institution || 'National Centre for Polar and Ocean Research (NCPOR)',
    methodology: '',
    keyFindings: ''
  });

  // Dataset Form State
  const [datasetForm, setDatasetForm] = useState({
    datasetId: '',
    title: '',
    description: '',
    region: 'Antarctica',
    scienceDomain: 'Cryosphere',
    stationId: 'maitri',
    stationName: 'Maitri',
    format: 'NetCDF / CSV',
    fileSize: '38.4 MB',
    accessType: 'Open Access',
    parameters: 'Active Layer Temperature, Borehole Thermistors, Soil Heat Flux',
    year: 2024
  });

  const regions = ['Antarctica', 'Arctic', 'Himalaya', 'Southern Ocean'];
  const domains = ['Cryosphere', 'Atmosphere', 'Oceanography', 'Biology', 'Geophysics', 'Climate Science'];
  const stations = [
    { id: 'maitri', name: 'Maitri Station (Antarctica)', region: 'Antarctica' },
    { id: 'bharati', name: 'Bharati Station (Antarctica)', region: 'Antarctica' },
    { id: 'himadri', name: 'Himadri Station (Arctic)', region: 'Arctic' },
    { id: 'himansh', name: 'Himansh Station (Himalaya)', region: 'Himalaya' },
    { id: 'indoos', name: 'IndOOS Moorings (Southern Ocean)', region: 'Southern Ocean' }
  ];

  // Fetch Researcher Submissions
  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await api.get('/research/my-submissions');
      if (res.data.success && res.data.data) {
        setMySubmissions(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load researcher submissions:', err.message);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Upload file to server
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploadingFile(true);
    const toastId = toast.loading(`Uploading document "${file.name}"...`);

    try {
      const response = await api.post('/research/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAttachedFile(response.data.data);
        toast.success(`Attached "${file.name}" (${response.data.data.fileSize})`, { id: toastId });
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error(error.response?.data?.message || 'File upload failed. Ensure file is under 25MB.', { id: toastId });
    } finally {
      setUploadingFile(false);
    }
  };

  // Sample Data 1-Click Auto Fill
  const fillSamplePublication = () => {
    setPubForm({
      title: 'High-Resolution Borehole Thermometry and Permafrost Thaw Regimes at Schirmacher Oasis, East Antarctica',
      authors: user?.name ? `${user.name}, Dr. Thamban Meloth, Dr. M. Ravichandran` : 'Dr. Rohit Srivastava, Dr. Thamban Meloth, Dr. M. Ravichandran',
      journal: 'Journal of Geophysical Research: Atmospheres',
      year: 2024,
      volume: '129',
      issue: '8',
      pages: 'e2024JD041289',
      doi: '10.1029/2024JD041289',
      region: 'Antarctica',
      scienceDomain: 'Cryosphere',
      stationId: 'maitri',
      stationName: 'Maitri',
      expeditionId: 'isea-43',
      abstract: 'Continuous multi-depth temperature telemetry (0 to 5.0 m) deployed at the Schirmacher Oasis adjacent to India\'s Maitri station reveals an unprecedented active layer deepening trend of 0.84 cm/year over the 2018–2024 observational period. Correlating borehole thermal regimes with high-resolution AWS radiation records demonstrates that shortwave albedo decay during peak December insolation drives rapid sub-surface heat flux, destabilizing relict permafrost horizons.',
      sourceUrl: 'https://doi.org/10.1029/2024JD041289'
    });
    setAttachedFile({
      fileUrl: '/uploads/research/sample_polar_manuscript_2024.pdf',
      fileName: 'borehole_permafrost_schirmacher_2024.pdf',
      fileSize: '4.82 MB'
    });
    toast.success('Sample Polar Publication loaded! Ready for submission.');
  };

  const fillSampleDataset = () => {
    setDatasetForm({
      datasetId: `NPDC-DS-2024-${Math.floor(100 + Math.random() * 900)}`,
      title: 'In-Situ Active Layer Permafrost Temperature & Soil Heat Flux Time Series (Maitri)',
      description: 'Continuous calibrated 15-minute interval sensor measurements from borehole thermistors (depths 0.1m, 0.5m, 1.0m, 2.5m, 5.0m) and Net Radiometers deployed in the Schirmacher Oasis during the 43rd ISEA campaign.',
      region: 'Antarctica',
      scienceDomain: 'Cryosphere',
      stationId: 'maitri',
      stationName: 'Maitri',
      format: 'NetCDF / CSV',
      fileSize: '64.2 MB',
      accessType: 'Open Access',
      parameters: 'Sub-surface soil temperature, Ground Heat Flux (W/m²), Soil volumetric water content',
      year: 2024
    });
    setAttachedFile({
      fileUrl: '/uploads/research/sample_npdc_telemetry_2024.nc',
      fileName: 'maitri_permafrost_telemetry_2024.nc',
      fileSize: '64.2 MB'
    });
    toast.success('Sample In-Situ Dataset loaded! Ready for submission.');
  };

  const fillSampleProject = () => {
    setProjForm({
      projectId: `POL-PRJ-2024-${Math.floor(100 + Math.random() * 900)}`,
      title: 'Active Layer Dynamics and Glacio-Hydrological Feedback in East Antarctic Oases',
      shortDescription: 'High-frequency borehole thermal logging and unmanned aerial multispectral mapping to quantify permafrost subsidence and supra-permafrost meltwater flux.',
      description: 'Operating from India\'s Maitri station in the Schirmacher Oasis, this project establishes long-term baseline data for polar active-layer degradation. The study combines automated thermistor strings with seasonal drone photogrammetry to detect ground subsidence and monitor lake drainage cycles into Lake Priyadarshini.',
      region: 'Antarctica',
      scienceDomain: 'Cryosphere',
      year: 2024,
      stationId: 'maitri',
      stationName: 'Maitri',
      expeditionId: 'isea-43',
      expeditionName: '43rd Indian Scientific Expedition to Antarctica',
      leadResearcherName: user?.name || 'Dr. Rohit Srivastava',
      institute: user?.institution || 'National Centre for Polar and Ocean Research (NCPOR)',
      methodology: 'Borehole thermistor string telemetry down to 5m depth, Campbell Scientific CR1000X dataloggers, and RTK-DGPS survey benchmarks.',
      keyFindings: 'Summer thaw penetration reached a record depth of 124 cm in January 2024, corresponding to elevated sensible heat fluxes during polar day.'
    });
    toast.success('Sample Polar Research Project loaded!');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeTab === 'publication') {
        if (!pubForm.title || !pubForm.abstract || !pubForm.journal) {
          toast.error('Please enter the paper title, journal name, and abstract.');
          setSubmitting(false);
          return;
        }

        const payload = {
          ...pubForm,
          fileUrl: attachedFile?.fileUrl || '',
          fileName: attachedFile?.fileName || '',
          fileSize: attachedFile?.fileSize || ''
        };

        const res = await api.post('/research/publication', payload);
        if (res.data.success) {
          toast.success('🎉 Research paper uploaded & indexed in VYOM successfully!');
          setAttachedFile(null);
          setPubForm({
            title: '',
            authors: user?.name ? `${user.name}, NCPOR Team` : '',
            journal: '',
            year: new Date().getFullYear(),
            volume: '',
            issue: '',
            pages: '',
            doi: '',
            region: 'Antarctica',
            scienceDomain: 'Cryosphere',
            stationId: 'maitri',
            stationName: 'Maitri',
            expeditionId: 'isea-43',
            abstract: '',
            sourceUrl: ''
          });
          fetchSubmissions();
        }
      } else if (activeTab === 'project') {
        if (!projForm.title || !projForm.shortDescription) {
          toast.error('Please enter the project title and description.');
          setSubmitting(false);
          return;
        }

        const payload = {
          ...projForm,
          leadResearcher: {
            name: projForm.leadResearcherName,
            institute: projForm.institute
          },
          fileUrl: attachedFile?.fileUrl || '',
          fileName: attachedFile?.fileName || ''
        };

        const res = await api.post('/research/project', payload);
        if (res.data.success) {
          toast.success('🎉 Polar Research Project registered successfully!');
          setAttachedFile(null);
          fetchSubmissions();
        }
      } else if (activeTab === 'dataset') {
        if (!datasetForm.title || !datasetForm.description) {
          toast.error('Please enter dataset title and description.');
          setSubmitting(false);
          return;
        }

        const payload = {
          ...datasetForm,
          parameters: datasetForm.parameters.split(',').map((p) => p.trim()),
          fileUrl: attachedFile?.fileUrl || '',
          fileName: attachedFile?.fileName || ''
        };

        const res = await api.post('/research/dataset', payload);
        if (res.data.success) {
          toast.success('🎉 In-Situ Dataset registered with NPDC successfully!');
          setAttachedFile(null);
          fetchSubmissions();
        }
      }
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error(err.response?.data?.message || 'Failed to submit research. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700 inline" />
            <span>National Polar Data Centre (NPDC) • Ministry of Earth Sciences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Upload & Submit Polar Research
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Ingest peer-reviewed scientific publications, observational datasets, and polar field campaigns into VYOM. Submissions are indexed into the searchable knowledge graph and linked with stations (Maitri, Bharati, Himadri, Himansh).
          </p>
        </div>

        {/* Solid Institutional Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={
              activeTab === 'publication'
                ? fillSamplePublication
                : activeTab === 'project'
                ? fillSampleProject
                : fillSampleDataset
            }
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Auto-fill sample data for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Load Sample {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          </button>
        </div>
      </div>

      {/* Researcher Identity Sub-Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xs">
            🔬
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800">{user?.name || 'Dr. Rohit Srivastava'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{user?.institution || 'National Centre for Polar and Ocean Research (NCPOR)'}</span>
            <span className="text-slate-400">•</span>
            <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
              {user?.role || 'Researcher'}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>MoES Polar Data Policy 2022 Compliant</span>
        </div>
      </div>

      {/* Main Submission Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & File Uploader (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingestion Mode Selector Tabs */}
          <div className="bg-white border border-slate-200 rounded-lg p-1.5 flex gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('publication')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'publication'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Research Publication / Paper</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dataset')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dataset'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>In-Situ Dataset (NPDC)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('project')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'project'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Field Project / Campaign</span>
            </button>
          </div>

          {/* Form Card */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag & Drop File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                  <span>Attached Research File / Manuscript / Dataset</span>
                  <span className="text-[10px] text-slate-400 font-normal">PDF, DOCX, CSV, NetCDF (.nc), ZIP (Max 25MB)</span>
                </label>

                {attachedFile ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{attachedFile.fileName}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          {attachedFile.fileSize} • Uploaded & Ready for Archival
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-teal-600 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.nc,.nc4,.csv,.zip,.gz,.xlsx,.txt"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 mx-auto flex items-center justify-center mb-2">
                      {uploadingFile ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {uploadingFile ? 'Uploading file...' : 'Drop your research file here, or browse files'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Upload preprint manuscript, scientific technical report, or observational NetCDF/CSV data file
                    </p>
                  </div>
                )}
              </div>

              {/* ----------------- PUBLICATION FORM ----------------- */}
              {activeTab === 'publication' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Publication Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Cryospheric Active Layer Dynamics in Schirmacher Oasis"
                      value={pubForm.title}
                      onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Authors (comma-separated) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rohit Srivastava, Dr. M. Ravichandran"
                        value={pubForm.authors}
                        onChange={(e) => setPubForm({ ...pubForm, authors: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Journal / Conference <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Polar Science, JGR Atmospheres, Current Science"
                        value={pubForm.journal}
                        onChange={(e) => setPubForm({ ...pubForm, journal: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                      <input
                        type="number"
                        value={pubForm.year}
                        onChange={(e) => setPubForm({ ...pubForm, year: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Volume</label>
                      <input
                        type="text"
                        placeholder="129"
                        value={pubForm.volume}
                        onChange={(e) => setPubForm({ ...pubForm, volume: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Issue</label>
                      <input
                        type="text"
                        placeholder="4"
                        value={pubForm.issue}
                        onChange={(e) => setPubForm({ ...pubForm, issue: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pages / Article ID</label>
                      <input
                        type="text"
                        placeholder="e2024JD041289"
                        value={pubForm.pages}
                        onChange={(e) => setPubForm({ ...pubForm, pages: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">DOI (Digital Object Identifier)</label>
                      <input
                        type="text"
                        placeholder="10.1029/2024JD041289"
                        value={pubForm.doi}
                        onChange={(e) => setPubForm({ ...pubForm, doi: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">External Paper URL / Publisher Link</label>
                      <input
                        type="url"
                        placeholder="https://doi.org/10.1029/..."
                        value={pubForm.sourceUrl}
                        onChange={(e) => setPubForm({ ...pubForm, sourceUrl: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Polar Region</label>
                      <select
                        value={pubForm.region}
                        onChange={(e) => setPubForm({ ...pubForm, region: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {regions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Science Domain</label>
                      <select
                        value={pubForm.scienceDomain}
                        onChange={(e) => setPubForm({ ...pubForm, scienceDomain: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {domains.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Polar Station</label>
                      <select
                        value={pubForm.stationId}
                        onChange={(e) => {
                          const st = stations.find((s) => s.id === e.target.value);
                          setPubForm({ ...pubForm, stationId: e.target.value, stationName: st ? st.name.split(' ')[0] : '' });
                        }}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {stations.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Scientific Abstract & Methodology <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Paste the complete abstract and key observational findings..."
                      value={pubForm.abstract}
                      onChange={(e) => setPubForm({ ...pubForm, abstract: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 leading-relaxed font-sans"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* ----------------- DATASET FORM ----------------- */}
              {activeTab === 'dataset' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dataset Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., In-Situ Active Layer Permafrost Temperature Time Series"
                      value={datasetForm.title}
                      onChange={(e) => setDatasetForm({ ...datasetForm, title: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Polar Region</label>
                      <select
                        value={datasetForm.region}
                        onChange={(e) => setDatasetForm({ ...datasetForm, region: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {regions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Science Domain</label>
                      <select
                        value={datasetForm.scienceDomain}
                        onChange={(e) => setDatasetForm({ ...datasetForm, scienceDomain: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {domains.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Station</label>
                      <select
                        value={datasetForm.stationId}
                        onChange={(e) => setDatasetForm({ ...datasetForm, stationId: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {stations.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">File Format</label>
                      <input
                        type="text"
                        placeholder="NetCDF / CSV / GeoTIFF"
                        value={datasetForm.format}
                        onChange={(e) => setDatasetForm({ ...datasetForm, format: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dataset Size</label>
                      <input
                        type="text"
                        placeholder="38.4 MB"
                        value={datasetForm.fileSize}
                        onChange={(e) => setDatasetForm({ ...datasetForm, fileSize: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">NPDC Access Type</label>
                      <select
                        value={datasetForm.accessType}
                        onChange={(e) => setDatasetForm({ ...datasetForm, accessType: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        <option value="Open Access">Open Access</option>
                        <option value="Request Data via NPDC">Request Data via NPDC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Observed Scientific Parameters</label>
                    <input
                      type="text"
                      placeholder="e.g., Active layer thermistors, Ground Heat Flux, Snow Water Equivalent"
                      value={datasetForm.parameters}
                      onChange={(e) => setDatasetForm({ ...datasetForm, parameters: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dataset Description & Sensor Metadata</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe sensor models, measurement frequencies, calibration notes..."
                      value={datasetForm.description}
                      onChange={(e) => setDatasetForm({ ...datasetForm, description: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* ----------------- PROJECT FORM ----------------- */}
              {activeTab === 'project' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Cryospheric Active Layer Dynamics in East Antarctic Oases"
                      value={projForm.title}
                      onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Lead PI / Researcher Name</label>
                      <input
                        type="text"
                        value={projForm.leadResearcherName}
                        onChange={(e) => setProjForm({ ...projForm, leadResearcherName: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Institution</label>
                      <input
                        type="text"
                        value={projForm.institute}
                        onChange={(e) => setProjForm({ ...projForm, institute: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Region</label>
                      <select
                        value={projForm.region}
                        onChange={(e) => setProjForm({ ...projForm, region: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {regions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Science Domain</label>
                      <select
                        value={projForm.scienceDomain}
                        onChange={(e) => setProjForm({ ...projForm, scienceDomain: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {domains.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Station Base</label>
                      <select
                        value={projForm.stationId}
                        onChange={(e) => setProjForm({ ...projForm, stationId: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      >
                        {stations.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Short Summary (For Public & Students)</label>
                    <input
                      type="text"
                      required
                      placeholder="One-line summary of what this polar research investigates..."
                      value={projForm.shortDescription}
                      onChange={(e) => setProjForm({ ...projForm, shortDescription: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Methodology & Campaign Objectives</label>
                    <textarea
                      rows={3}
                      placeholder="Deployment protocol, sensor equipment, satellite ground-truthing..."
                      value={projForm.methodology}
                      onChange={(e) => setProjForm({ ...projForm, methodology: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Submissions are verified against MoES scientific data policy.</span>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || uploadingFile}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting into VYOM...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Submit to VYOM Repository</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Ingestion Status & Live Submissions (1 Col) */}
        <div className="space-y-6">
          {/* Quick Metrics Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>National Ingestion Pipeline</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Verification Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Fast-Track
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">NPDC Data Policy</span>
                <span className="font-semibold text-slate-800">MoES 2022 Compliant</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Knowledge Graph Sync</span>
                <span className="font-semibold text-blue-700">Real-Time Traversal</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100">
              Uploaded research documents and peer-reviewed citations automatically link with their respective Arctic, Antarctic, or Himalayan field stations in the unified search index.
            </div>
          </div>

          {/* Recently Uploaded Research by This Researcher */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>My Indexed Research</span>
              </h3>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {mySubmissions.publications.length} Papers
              </span>
            </div>

            {loadingSubmissions ? (
              <div className="text-center py-6 text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>Loading your indexed submissions...</span>
              </div>
            ) : mySubmissions.publications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No research papers uploaded yet. Use the form on the left to submit your first paper!
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {mySubmissions.publications.map((pub) => (
                  <div
                    key={pub.publicationId || pub._id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-lg space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={pub.region.toLowerCase()}>{pub.region}</Badge>
                      <Badge variant="verified">Verified Citation</Badge>
                      <span className="text-[10px] font-mono text-slate-500">{pub.year}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {pub.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {pub.journal} • {pub.authors?.join(', ')}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      {pub.fileUrl ? (
                        <a
                          href={pub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF Document</span>
                        </a>
                      ) : pub.doi ? (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>DOI: {pub.doi}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">Indexed</span>
                      )}

                      <Link
                        to="/publications"
                        className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-0.5"
                      >
                        <span>View Repository</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResearchPage;
