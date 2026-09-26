'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { BarChart3, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <AppShell initialRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">System Analytics</h1>
          <p className="text-sm text-slate-500 font-medium">Performance metrics, average resolution times, and campus trends.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Avg. Resolution Time" count="4.2 hrs" trendText="-18%" icon={<Clock className="w-6 h-6 text-[#2563eb]" />} iconBgColor="bg-blue-50" />
          <StatCard title="Resolution Rate" count="94.2%" trendText="+3%" icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} iconBgColor="bg-emerald-50" />
          <StatCard title="Monthly Reports" count="312" trendText="+14%" icon={<BarChart3 className="w-6 h-6 text-purple-600" />} iconBgColor="bg-purple-50" />
          <StatCard title="Match Accuracy" count="88.6%" trendText="+6%" icon={<TrendingUp className="w-6 h-6 text-cyan-600" />} iconBgColor="bg-cyan-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Building Breakdown</h3>
            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <div className="flex justify-between mb-1"><span>Block C</span><span>35%</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-full bg-[#2563eb] rounded-full w-[35%]" /></div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>Block A</span><span>28%</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-full bg-indigo-500 rounded-full w-[28%]" /></div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>Library</span><span>20%</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-full bg-teal-500 rounded-full w-[20%]" /></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Peak Reporting Hours</h3>
            <p className="text-xs text-slate-500">Most issue submissions occur between 10:00 AM and 2:00 PM on weekdays.</p>
            <div className="h-32 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-center text-xs text-slate-400 font-bold">
              [ Hourly Activity Graph Preview ]
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
