import React from 'react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let label = status;
  let styleClass = 'bg-blue-50 text-[#2563eb] border-blue-200';

  const normalized = status.toLowerCase().replace(/[\s_]+/g, '');

  switch (normalized) {
    case 'open':
    case 'reported':
      label = 'Open';
      styleClass = 'bg-red-50 text-red-600 border-red-200';
      break;
    case 'inprogress':
      label = 'In Progress';
      styleClass = 'bg-blue-50 text-blue-600 border-blue-200';
      break;
    case 'assigned':
      label = 'Assigned';
      styleClass = 'bg-orange-50 text-orange-600 border-orange-200';
      break;
    case 'resolved':
      label = 'Resolved';
      styleClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
      break;
    case 'searching':
      label = 'Searching';
      styleClass = 'bg-purple-50 text-purple-600 border-purple-200';
      break;
    case 'possiblematch':
      label = 'Possible Match';
      styleClass = 'bg-green-50 text-green-600 border-green-200';
      break;
    case 'underreview':
      label = 'Under Review';
      styleClass = 'bg-amber-50 text-amber-600 border-amber-200';
      break;
    case 'claimed':
    case 'approved':
      label = status === 'approved' ? 'Approved' : 'Claimed';
      styleClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
      break;
    case 'pending':
      label = 'Pending';
      styleClass = 'bg-amber-50 text-amber-600 border-amber-200';
      break;
    case 'rejected':
      label = 'Rejected';
      styleClass = 'bg-red-50 text-red-600 border-red-200';
      break;
    case 'closed':
    case 'closedduplicate':
      label = normalized === 'closedduplicate' ? 'Closed (Duplicate)' : 'Closed';
      styleClass = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    default:
      label = status;
      styleClass = 'bg-blue-50 text-[#2563eb] border-blue-200';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`rounded-full font-bold border inline-flex items-center gap-1 shrink-0 ${sizeClass} ${styleClass}`}>
      {label}
    </span>
  );
};
