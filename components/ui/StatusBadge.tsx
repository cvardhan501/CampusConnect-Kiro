import React from 'react';

export type CanonicalStatus =
  | 'Reported'
  | 'Under_Review'
  | 'Assigned'
  | 'In_Progress'
  | 'Resolved'
  | 'Verified'
  | 'Verification'
  | 'Work in Process'
  | 'Completed'
  | 'New'
  | 'Pending'
  | 'Active'
  | 'Open'
  | 'Claimed'
  | string;

export interface StatusBadgeProps {
  status: CanonicalStatus;
  userFacing?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, userFacing = true }) => {
  const norm = (status || '').toString().toLowerCase();

  let label = status;
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm === 'reported' || norm === 'under_review' || norm === 'assigned' || norm === 'verification' || norm === 'pending') {
    label = userFacing && norm !== 'pending' ? 'Verification' : norm === 'pending' ? 'Pending' : 'Reported';
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (norm === 'in_progress' || norm === 'work in process' || norm === 'active') {
    label = userFacing && norm !== 'active' ? 'Work in Process' : norm === 'active' ? 'Active' : 'In Progress';
    bgClass = 'bg-blue-50 text-[#2563eb] border-blue-200/80';
  } else if (norm === 'resolved' || norm === 'verified' || norm === 'completed') {
    label = userFacing ? 'Completed' : 'Resolved';
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (norm === 'new') {
    label = 'New';
    bgClass = 'bg-sky-50 text-sky-700 border-sky-200/80';
  } else if (norm === 'open') {
    label = 'Open';
    bgClass = 'bg-[#2563eb]/10 text-[#2563eb] border-blue-200';
  } else if (norm === 'claimed') {
    label = 'Claimed';
    bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${bgClass}`}
    >
      {label}
    </span>
  );
};
