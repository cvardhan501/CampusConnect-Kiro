import React from 'react';
import Link from 'next/link';
import { Snowflake, Armchair, Wifi, Droplet, Zap, Wrench, ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export interface RequestCardProps {
  request: any;
  showPriority?: boolean;
  hrefPrefix?: string; // '/issues', '/staff/issues', '/admin/issues'
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  showPriority = false,
  hrefPrefix = '/issues',
}) => {
  const issueId = request._id || request.id;
  const category = (request.category || '').toLowerCase();

  const getIcon = () => {
    if (category.includes('ac') || category.includes('hvac') || category.includes('facilities'))
      return <Snowflake className="w-5 h-5 text-blue-600" />;
    if (category.includes('furniture') || category.includes('chair'))
      return <Armchair className="w-5 h-5 text-amber-600" />;
    if (category.includes('wifi') || category.includes('network') || category.includes('it'))
      return <Wifi className="w-5 h-5 text-indigo-600" />;
    if (category.includes('water') || category.includes('plumbing'))
      return <Droplet className="w-5 h-5 text-teal-600" />;
    if (category.includes('electrical') || category.includes('power'))
      return <Zap className="w-5 h-5 text-purple-600" />;
    return <Wrench className="w-5 h-5 text-[#2563eb]" />;
  };

  const getIconBg = () => {
    if (category.includes('ac') || category.includes('hvac') || category.includes('facilities'))
      return 'bg-blue-50';
    if (category.includes('furniture') || category.includes('chair')) return 'bg-amber-50';
    if (category.includes('wifi') || category.includes('network') || category.includes('it'))
      return 'bg-indigo-50';
    if (category.includes('water') || category.includes('plumbing')) return 'bg-teal-50';
    if (category.includes('electrical') || category.includes('power')) return 'bg-purple-50';
    return 'bg-blue-50';
  };

  const locationText =
    request.location || `${request.building || ''} ${request.room || ''}`.trim() || 'Main Campus';
  const assignedText = request.assignedTo?.displayName
    ? `Assigned: ${request.assignedTo.displayName}`
    : 'Waiting for assignment';

  const ticketCode = request.ticketId || `CC-2026-${(issueId || '').toString().slice(-5).toUpperCase()}`;

  const formattedTime = request.createdAt
    ? new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  return (
    <Link
      href={`${hrefPrefix}/${issueId}`}
      className="group block bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#2563eb] transition-colors">
                {request.title}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0">{ticketCode}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-2 mt-0.5">
              <span>{locationText} • {request.category}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showPriority && request.priority && <PriorityBadge priority={request.priority} />}
          <StatusBadge status={request.status} />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">{formattedTime}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
};
