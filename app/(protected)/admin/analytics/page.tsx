'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { BarChart3, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [lostItems, setLostItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/issues').then((r) => (r.ok ? r.json() : { issues: [] })),
      fetch('/api/lost-found').then((r) => (r.ok ? r.json() : { items: [] })),
    ])
      .then(([issueData, itemData]) => {
        setIssues(issueData.issues || []);
        setLostItems(itemData.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resolvedCount = issues.filter((i) => i.status === 'Resolved' || i.status === 'Verified').length;
  const resolutionRate = issues.length > 0 ? `${Math.round((resolvedCount / issues.length) * 100)}%` : '0%';
  const returnedCount = lostItems.filter((i) => i.status === 'Returned' || i.status === 'Claimed').length;
  const matchAccuracy = lostItems.length > 0 ? `${Math.round((returnedCount / lostItems.length) * 100)}%` : '0%';

  // Dynamic Building Breakdown
  const buildingCounts: Record<string, number> = {};
  issues.forEach((i) => {
    const loc = i.location || i.building || 'Main Campus';
    const building = loc.split('•')[0].trim();
    buildingCounts[building] = (buildingCounts[building] || 0) + 1;
  });

  const totalLocs = issues.length || 1;
  const buildingBreakdown = Object.entries(buildingCounts).map(([bld, cnt]) => ({
    name: bld,
    pct: Math.round((cnt / totalLocs) * 100),
  }));

  return (
    <AppShell initialRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">System Analytics</h1>
          <p className="text-sm text-slate-500 font-medium">Performance metrics, average resolution times, and campus trends.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Issues" count={issues.length} trendText="Recorded" icon={<Clock className="w-6 h-6 text-[#2563eb]" />} iconBgColor="bg-blue-50" />
          <StatCard title="Resolution Rate" count={resolutionRate} trendText="Resolved / Total" icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} iconBgColor="bg-emerald-50" />
          <StatCard title="Lost & Found Items" count={lostItems.length} trendText="Total Items" icon={<BarChart3 className="w-6 h-6 text-purple-600" />} iconBgColor="bg-purple-50" />
          <StatCard title="Return Match Rate" count={matchAccuracy} trendText="Returned / Total" icon={<TrendingUp className="w-6 h-6 text-cyan-600" />} iconBgColor="bg-cyan-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Building & Location Breakdown</h3>
            {loading ? (
              <p className="text-xs text-slate-400">Loading breakdown...</p>
            ) : buildingBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400">No building data recorded yet.</p>
            ) : (
              <div className="space-y-3 text-xs font-bold text-slate-700">
                {buildingBreakdown.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <span>{item.name}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-full bg-[#2563eb] rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Peak Reporting Hours & Status Overview</h3>
            <p className="text-xs text-slate-500">Live summary of active campus issues and resolution velocity.</p>
            <div className="h-32 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-center text-xs text-slate-500 font-bold p-4 text-center">
              Active Issues: {issues.filter((i) => i.status !== 'Resolved' && i.status !== 'Verified').length} • Resolved: {resolvedCount}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
