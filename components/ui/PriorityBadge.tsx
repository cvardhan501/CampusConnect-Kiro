import React from 'react';

export interface PriorityBadgeProps {
  priority: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let styleClass = 'bg-slate-100 text-slate-700 border-slate-200';

  const normalized = priority.toLowerCase();

  switch (normalized) {
    case 'low':
      styleClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
      break;
    case 'medium':
      styleClass = 'bg-amber-50 text-amber-600 border-amber-200';
      break;
    case 'high':
      styleClass = 'bg-orange-50 text-orange-600 border-orange-200';
      break;
    case 'critical':
      styleClass = 'bg-red-50 text-red-600 border-red-200 font-extrabold animate-pulse';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center capitalize ${styleClass}`}>
      {priority}
    </span>
  );
};
