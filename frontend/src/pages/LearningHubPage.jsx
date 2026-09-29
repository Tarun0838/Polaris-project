import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export const LearningHubPage = () => {
  const [topics, setTopics] = useState([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/education');
        const data = response.data.data || [];
        setTopics(data);
        if (data.length > 0) {
          loadTopicDetail(data[0].slug);
        }
      } catch (err) {
        console.error('Failed to load educational topics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const loadTopicDetail = async (slug) => {
    setActiveSlug(slug);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await api.get(`/education/${slug}`);
      setSelectedTopic(res.data.data);
    } catch (err) {
      console.error('Failed to load topic details:', err);
    }
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!selectedTopic?.quiz) return;
    let score = 0;
    selectedTopic.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Learning Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-800/80 border border-cyan-400/30 px-3 py-1 rounded-full text-xs text-cyan-300 font-medium">
            <GraduationCap className="w-3.5 h-3.5" />
            Polaris Smart Education Initiative • MoES
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
            Student Polar Learning Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Translating complex polar and glaciological science into understandable, curriculum-aligned concepts. Grounded strictly in authentic NCPOR/NPDC field research.
          </p>
        </div>
      </div>

      {/* Main Learning Hub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Topics Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider px-1">
            Curated Educational Modules
          </h3>

          <div className="space-y-2">
            {topics.map((t) => (
              <div
                key={t.slug}
                onClick={() => loadTopicDetail(t.slug)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  activeSlug === t.slug
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="project">{t.category}</Badge>
                  <span className="text-[10px] text-slate-400 font-medium">{t.targetLevel}</span>
                </div>
                <h4 className={`text-xs sm:text-sm font-bold mt-2 ${
                  activeSlug === t.slug ? 'text-blue-900' : 'text-slate-900'
                }`}>
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {t.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Topic Interactive View */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTopic ? (
            <div className="space-y-6">
              {/* Module Header Card */}
              <Card className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="project">{selectedTopic.category}</Badge>
                  <Badge variant="verified">Source Grounded</Badge>
                  <span className="text-xs font-medium text-slate-400">• Level: {selectedTopic.targetLevel}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  {selectedTopic.title}
                </h2>

                <div className="space-y-4 pt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Simple Explanation</h3>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl leading-relaxed text-slate-700">
                      {selectedTopic.simpleExplanation}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Why It Matters</h3>
                    <div className="bg-sky-50/60 border border-sky-200 p-4 rounded-xl leading-relaxed text-sky-950">
                      {selectedTopic.whyItMatters}
                    </div>
                  </div>
                </div>

                {/* Key Concepts List */}
                <div className="pt-2">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Key Scientific Concepts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTopic.keyConcepts?.map((kc, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-blue-700">💡 {kc.term}</div>
                        <div className="text-slate-600 leading-relaxed">{kc.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Interactive Scientific Chart (Recharts) */}
              {selectedTopic.chartData && selectedTopic.chartData.points?.length > 0 && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        {selectedTopic.chartData.title}
                      </h3>
                      <p className="text-xs text-slate-500">Unit: {selectedTopic.chartData.unit} • NPDC Reference Baseline</p>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedTopic.chartData.points} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                          formatter={(value) => [`${value} ${selectedTopic.chartData.unit}`, 'Observed Value']}
                        />
                        <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Student Quiz Section */}
              {selectedTopic.quiz && selectedTopic.quiz.length > 0 && (
                <Card className="p-6 space-y-5 border-blue-200 bg-blue-50/20">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        Check Your Understanding (Interactive Quiz)
                      </h3>
                    </div>
                    {quizSubmitted && (
                      <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full">
                        Score: {quizScore} / {selectedTopic.quiz.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {selectedTopic.quiz.map((q, qIdx) => {
                      const isSelected = quizAnswers[qIdx] !== undefined;
                      const isCorrect = quizAnswers[qIdx] === q.correctIndex;

                      return (
                        <div key={qIdx} className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {qIdx + 1}. {q.question}
                          </h4>

                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => {
                              const isThisSelected = quizAnswers[qIdx] === optIdx;
                              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                              if (quizSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                                } else if (isThisSelected) {
                                  btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                                }
                              } else if (isThisSelected) {
                                btnStyle = 'bg-blue-100 border-blue-500 text-blue-900 font-semibold';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectOption(qIdx, optIdx)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && optIdx === q.correctIndex && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                  {quizSubmitted && isThisSelected && optIdx !== q.correctIndex && (
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="pt-2 text-xs text-slate-600 border-t border-slate-100 bg-slate-50 p-2.5 rounded">
                              <strong>Scientific Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit / Reset Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {quizSubmitted ? (
                      <Button variant="secondary" size="sm" onClick={handleResetQuiz} icon={RefreshCw}>
                        Retake Quiz
                      </Button>
                    ) : (
                      <Button
                        variant="polar"
                        size="md"
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < selectedTopic.quiz.length}
                      >
                        Submit Answers
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {/* Connected Research Records */}
              {selectedTopic.relatedProject && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Grounded In Verified Research</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedTopic.relatedProject.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Station: {selectedTopic.relatedProject.stationName} • Lead: {selectedTopic.relatedProject.leadResearcher?.name}
                    </p>
                  </div>
                  <Link to={`/research/${selectedTopic.relatedProject.projectId}`}>
                    <Button variant="secondary" size="sm">
                      View Source Record →
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select a learning module from the left menu to start learning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningHubPage;
