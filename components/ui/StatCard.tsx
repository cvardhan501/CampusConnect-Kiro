import React from 'react';

export interface StatCardProps {
  title: string;
  count: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trendText?: string;
  trendPositive?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  icon,
  iconBgColor = 'bg-blue-50 text-[#2563eb]',
  trendText,
  trendPositive = true,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between ${className}`}>
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{count}</h3>
          {trendText && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                trendPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {trendText}
            </span>
          )}
        </div>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
        {icon}
      </div>
    </div>
  );
};
