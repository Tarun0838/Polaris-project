import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, CheckCircle2, ExternalLink, Calendar, User, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export const PublicOutreachFeedPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudience, setSelectedAudience] = useState('All');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/content', {
          params: { status: 'published', audience: selectedAudience }
        });
        setArticles(response.data.data || []);
      } catch (err) {
        console.error('Failed to load published outreach:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [selectedAudience]);

  const audiences = ['All', 'School Student', 'College Student', 'General Public', 'Research Audience'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Curator-Verified Dissemination</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Public Polar Science Outreach Portal
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Articles, explainers, and factsheets synthesized from verified MoES polar research—vetted by science curators before public release.
        </p>
      </div>

      {/* Audience Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 border-b border-slate-200">
        {audiences.map((aud) => (
          <button
            key={aud}
            onClick={() => setSelectedAudience(aud)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedAudience === aud
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {aud === 'All' ? 'All Audiences' : aud}
          </button>
        ))}
      </div>

      {/* Articles Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
          No published outreach content found in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((item) => (
            <Card key={item._id} hover className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="published">Curator Verified</Badge>
                    <Badge variant="project">{item.contentType}</Badge>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Audience: <strong>{item.audience}</strong></span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                  {item.content}
                </p>

                {/* Key Facts snippet */}
                {item.keyFacts && item.keyFacts.length > 0 && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs space-y-1">
                    <span className="font-bold text-[10px] uppercase text-slate-700">Verified Fact:</span>
                    <p className="text-slate-600 text-[11px] line-clamp-1">{item.keyFacts[0]}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Source: <strong className="text-slate-700">{item.projectTitle}</strong></span>
                <Link to={`/research/${item.projectId}`}>
                  <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                    <span>Source Data</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicOutreachFeedPage;
