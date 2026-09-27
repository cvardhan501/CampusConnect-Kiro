'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Users, CheckCircle2, Package, RotateCcw, Wrench, ShieldCheck } from 'lucide-react';
import { DEMO_ADMIN_STATS } from '@/lib/demo-data';
import { LastUpdatedIndicator } from '@/components/ui/LastUpdatedIndicator';

export default function AdminDashboardPage() {
  const stats = DEMO_ADMIN_STATS;

  return (
    <AppShell initialRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Campus overview and key statistics</p>
          </div>
          <LastUpdatedIndicator />
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            count={stats.totalUsers}
            trendText={stats.totalUsersTrend}
            icon={<Users className="w-6 h-6 text-[#2563eb]" />}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            title="Resolved"
            count={stats.resolvedIssues}
            trendText={stats.resolvedIssuesTrend}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            title="Lost Items"
            count={stats.lostItems}
            trendText={stats.lostItemsTrend}
            icon={<Package className="w-6 h-6 text-cyan-600" />}
            iconBgColor="bg-cyan-50"
          />
          <StatCard
            title="Returned"
            count={stats.returnedItems}
            trendText={stats.returnedItemsTrend}
            icon={<RotateCcw className="w-6 h-6 text-purple-600" />}
            iconBgColor="bg-purple-50"
          />
        </div>

        {/* Main Grid: Categories & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issue Categories Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Issue Categories</h3>

            <div className="space-y-4">
              {stats.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.category}
                    </span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>

            <div className="space-y-4">
              {stats.recentActivity.map((act) => (
                <div key={act.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {act.type === 'issue_new' ? (
                        <Wrench className="w-4 h-4 text-[#2563eb]" />
                      ) : act.type === 'item_claimed' ? (
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                      <p className="text-[11px] text-slate-500">{act.details}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
