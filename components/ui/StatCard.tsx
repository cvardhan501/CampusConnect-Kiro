import React from 'react';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  badgeColor?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  badgeColor = 'blue',
  trend,
  trendUp = true,
}) => {
  const badgeStyles = {
    blue: 'bg-blue-50 text-[#2563eb] border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const iconBgStyles = {
    blue: 'bg-blue-50 text-[#2563eb]',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{value}</span>
          {trend && (
            <span
              className={`text-xs font-bold ${
                trendUp ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      </div>
      {icon && (
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${badgeStyles[badgeColor]}`}
        >
          {icon}
        </div>
      )}
    </div>
  );
};
