'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export interface LastUpdatedIndicatorProps {
  className?: string;
  showRefreshButton?: boolean;
}

export const LastUpdatedIndicator: React.FC<LastUpdatedIndicatorProps> = ({
  className = '',
  showRefreshButton = true,
}) => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeAgoText, setTimeAgoText] = useState<string>('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

      if (diffInSeconds < 30) {
        setTimeAgoText('Just now');
      } else if (diffInSeconds < 60) {
        setTimeAgoText('Less than 1m ago');
      } else {
        const mins = Math.floor(diffInSeconds / 60);
        setTimeAgoText(`${mins}m ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 15000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeAgoText('Just now');

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-medium text-slate-600 transition-all hover:border-slate-300 ${className}`}
      title="Dashboard live data status"
    >
      {/* Live Pulsing Dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      {/* Label & Timestamp */}
      <span className="text-slate-500 whitespace-nowrap">
        Last updated <span className="font-semibold text-slate-700">{timeAgoText}</span>
      </span>

      {/* Manual Refresh Action */}
      {showRefreshButton && (
        <button
          type="button"
          onClick={handleRefresh}
          className="ml-0.5 p-0.5 rounded-full text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors focus:outline-hidden"
          title="Refresh dashboard data indicator"
          aria-label="Refresh dashboard timestamp"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#2563eb]' : ''}`} />
        </button>
      )}
    </div>
  );
};
