import React from 'react';
import { Check } from 'lucide-react';

export type TimelineStep = 'Reported' | 'Verification' | 'Work in Process' | 'Completed';

export interface StatusTimelineProps {
  currentStatus: string; // Canonical status (Reported, Under_Review, Assigned, In_Progress, Resolved, Verified)
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  const steps: { id: TimelineStep; label: string }[] = [
    { id: 'Reported', label: 'Reported' },
    { id: 'Verification', label: 'Verification' },
    { id: 'Work in Process', label: 'Work in Process' },
    { id: 'Completed', label: 'Completed' },
  ];

  const norm = (currentStatus || '').toLowerCase();

  // Determine current active index (0 to 3)
  let activeIndex = 0;
  if (norm === 'reported') {
    activeIndex = 0;
  } else if (norm === 'under_review' || norm === 'assigned' || norm === 'verification') {
    activeIndex = 1;
  } else if (norm === 'in_progress' || norm === 'work in process') {
    activeIndex = 2;
  } else if (norm === 'resolved' || norm === 'verified' || norm === 'completed') {
    activeIndex = 3;
  }

  return (
    <div className="w-full py-4 px-2" role="region" aria-label="Issue Status Progress">
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" aria-hidden="true" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#2563eb] transition-all duration-300 z-0"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 88}%` }}
          aria-hidden="true"
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const statusText = isCompleted ? 'Completed step' : isCurrent ? 'Current step' : 'Upcoming step';

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`${step.label} (${statusText})`}
              title={`${step.label} (${statusText})`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#2563eb] text-white ring-4 ring-blue-50'
                    : isCurrent
                    ? 'bg-[#2563eb] text-white ring-4 ring-blue-100 shadow-md scale-110'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#2563eb] font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
