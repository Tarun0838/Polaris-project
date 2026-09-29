import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Unlock, Globe2, Compass } from 'lucide-react';

export const Badge = ({ variant = 'default', children, className = '', icon = true }) => {
  const getStyles = () => {
    switch (variant) {
      case 'official':
      case 'verified':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-1 ring-emerald-500/20';
      case 'dataset':
        return 'bg-sky-50 text-sky-800 border-sky-200/80 ring-1 ring-sky-500/20';
      case 'report':
        return 'bg-amber-50 text-amber-900 border-amber-200/80 ring-1 ring-amber-500/20';
      case 'publication':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200/80 ring-1 ring-indigo-500/20';
      case 'project':
        return 'bg-blue-50 text-blue-900 border-blue-200/80 ring-1 ring-blue-500/20';
      case 'antarctica':
        return 'bg-cyan-50 text-cyan-900 border-cyan-200/80 ring-1 ring-cyan-500/20';
      case 'arctic':
        return 'bg-teal-50 text-teal-900 border-teal-200/80 ring-1 ring-teal-500/20';
      case 'himalaya':
        return 'bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-500/20';
      case 'southern ocean':
        return 'bg-blue-100/70 text-blue-900 border-blue-200';
      case 'open-access':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'request-data':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'in_review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'published':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getIcon = () => {
    if (!icon) return null;
    switch (variant) {
      case 'official':
      case 'verified':
        return <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 inline-block" />;
      case 'open-access':
        return <Unlock className="w-3 h-3 mr-1 text-green-600 inline-block" />;
      case 'request-data':
        return <Lock className="w-3 h-3 mr-1 text-amber-600 inline-block" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()} ${className}`}
    >
      {getIcon()}
      {children}
    </span>
  );
};

export default Badge;
