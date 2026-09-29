'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function AdminReportsPage() {
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/admin/reports', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setReportsData(data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const metrics = reportsData?.metrics || {
    totalRequests: 42,
    avgResolutionDays: 2.8,
    completionRate: 86,
  };

  const categories = reportsData?.categories || [
    { category: 'Facilities', count: 18 },
    { category: 'IT Support', count: 12 },
    { category: 'Maintenance', count: 6 },
    { category: 'Electrical', count: 4 },
    { category: 'Plumbing', count: 2 },
  ];

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6 select-none">
        {/* Header (Matching Screen #14) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 font-medium">Insights into campus operations.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Sep 1, 2026 - Sep 30, 2026</span>
            </div>
            <Button variant="outline" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </div>
        </div>

        {/* 3 Metric Cards Row (Matching Screen #14) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Requests"
            value={metrics.totalRequests}
            trend="12%"
            trendUp={true}
            icon={<BarChart3 className="w-6 h-6 text-[#2563eb]" />}
            badgeColor="blue"
          />
          <StatCard
            label="Avg. Resolution Time"
            value={`${metrics.avgResolutionDays} days`}
            trend="18%"
            trendUp={true}
            icon={<Calendar className="w-6 h-6 text-emerald-600" />}
            badgeColor="green"
          />
          <StatCard
            label="Completion Rate"
            value={`${metrics.completionRate}%`}
            trend="4%"
            trendUp={true}
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            badgeColor="purple"
          />
        </div>

        {/* Analytics Visualizations Grid (Matching Screen #14) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Category Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Requests by Category
              </h3>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
              <div className="w-36 h-36 rounded-full border-8 border-blue-500 border-t-purple-500 border-r-amber-500 border-l-emerald-500 flex items-center justify-center shrink-0">
                <div className="text-center">
                  <span className="text-xl font-extrabold text-slate-900">{metrics.totalRequests}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {categories.map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                      <span className="font-semibold text-slate-700">{c.category}</span>
                    </div>
                    <span className="font-bold text-slate-900">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Trend Line Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Request Trend
              </h3>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-8 px-4 border-b border-slate-200/80">
              {[8, 12, 16, 22, 28, 35, 42].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-[#2563eb] rounded-t-lg transition-all duration-300 hover:bg-[#1d4ed8]"
                    style={{ height: `${(val / 42) * 100}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-400">Sep {idx * 4 + 4}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
