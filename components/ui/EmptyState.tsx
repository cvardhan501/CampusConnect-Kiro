import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-blue-50/80 text-[#2563eb] flex items-center justify-center border border-blue-100/80 shadow-xs">
          {icon}
        </div>
      )}
      <div className="max-w-md space-y-1">
        <h4 className="text-base font-extrabold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
