import React from 'react';
import Link from 'next/link';
import { Snowflake, Armchair, Wifi, Droplet, Zap, Wrench, ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { DemoIssue } from '@/lib/demo-data';

export interface IssueCardProps {
  issue: any;
  showPriority?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, showPriority = false }) => {
  const issueId = issue._id || issue.id;
  const category = (issue.category || '').toLowerCase();

  const getIcon = () => {
    if (category.includes('ac') || category.includes('hvac')) return <Snowflake className="w-5 h-5 text-blue-600" />;
    if (category.includes('furniture') || category.includes('chair')) return <Armchair className="w-5 h-5 text-amber-600" />;
    if (category.includes('wifi') || category.includes('network') || category.includes('it')) return <Wifi className="w-5 h-5 text-indigo-600" />;
    if (category.includes('water') || category.includes('plumbing')) return <Droplet className="w-5 h-5 text-teal-600" />;
    if (category.includes('electrical') || category.includes('power')) return <Zap className="w-5 h-5 text-purple-600" />;
    return <Wrench className="w-5 h-5 text-[#2563eb]" />;
  };

  const getIconBg = () => {
    if (category.includes('ac') || category.includes('hvac')) return 'bg-blue-50';
    if (category.includes('furniture') || category.includes('chair')) return 'bg-amber-50';
    if (category.includes('wifi') || category.includes('network') || category.includes('it')) return 'bg-indigo-50';
    if (category.includes('water') || category.includes('plumbing')) return 'bg-teal-50';
    if (category.includes('electrical') || category.includes('power')) return 'bg-purple-50';
    return 'bg-blue-50';
  };

  const locationText = issue.location || `${issue.building || ''} ${issue.room || ''}`.trim() || 'Main Campus';
  const assignedText = issue.assignedTo?.displayName
    ? `Assigned: ${issue.assignedTo.displayName}`
    : 'Waiting for assignment';

  const formattedDate = issue.createdAt
    ? new Date(issue.createdAt).toLocaleDateString()
    : 'Recently';

  return (
    <Link
      href={`/issues/${issueId}`}
      className="group block bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-blue-300 hover:shadow transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#2563eb] transition-colors">
              {issue.title}
            </h4>
            <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-2">
              <span>{locationText}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{assignedText}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showPriority && issue.priority && <PriorityBadge priority={issue.priority} />}
          <StatusBadge status={issue.status} />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">{formattedDate}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
};
