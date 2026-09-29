import React from 'react';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical' | string;

export interface PriorityBadgeProps {
  priority: IssuePriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const norm = (priority || '').toString().toLowerCase();

  let label = priority || 'Medium';
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm === 'low') {
    bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (norm === 'medium') {
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (norm === 'high') {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm === 'critical' || norm === 'urgent') {
    label = norm === 'urgent' ? 'Urgent' : 'High Priority';
    bgClass = 'bg-red-50 text-red-700 border-red-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${bgClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};
