import React from 'react';
import Link from 'next/link';
import { Snowflake, Armchair, Wifi, Droplet, Zap, Wrench, ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { DemoIssue } from '@/lib/demo-data';

export interface IssueCardProps {
  issue: DemoIssue;
  showPriority?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, showPriority = false }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ac':
        return <Snowflake className="w-5 h-5 text-blue-600" />;
      case 'chair':
        return <Armchair className="w-5 h-5 text-amber-600" />;
      case 'wifi':
        return <Wifi className="w-5 h-5 text-indigo-600" />;
      case 'water':
        return <Droplet className="w-5 h-5 text-teal-600" />;
      case 'electrical':
        return <Zap className="w-5 h-5 text-purple-600" />;
      default:
        return <Wrench className="w-5 h-5 text-[#2563eb]" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'ac':
        return 'bg-blue-50';
      case 'chair':
        return 'bg-amber-50';
      case 'wifi':
        return 'bg-indigo-50';
      case 'water':
        return 'bg-teal-50';
      case 'electrical':
        return 'bg-purple-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <Link
      href={`/issues/${issue.id}`}
      className="group block bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-blue-300 hover:shadow transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(issue.iconType)}`}>
            {getIcon(issue.iconType)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#2563eb] transition-colors">
              {issue.title}
            </h4>
            <p className="text-xs text-slate-500 font-medium truncate">
              {issue.building} • {issue.room}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showPriority && <PriorityBadge priority={issue.priority} />}
          <StatusBadge status={issue.status} />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">{issue.createdAt}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
};
