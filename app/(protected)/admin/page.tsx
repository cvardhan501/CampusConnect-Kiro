'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Users, CheckCircle2, Package, RotateCcw, Wrench, ShieldCheck } from 'lucide-react';
import { LastUpdatedIndicator } from '@/components/ui/LastUpdatedIndicator';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    resolvedIssues: 0,
    lostItems: 0,
    returnedItems: 0,
    categoryBreakdown: [] as { category: string; percentage: number; color: string }[],
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then((r) => (r.ok ? r.json() : { users: [] })),
      fetch('/api/issues').then((r) => (r.ok ? r.json() : { issues: [] })),
      fetch('/api/lost-found').then((r) => (r.ok ? r.json() : { items: [] })),
      fetch('/api/admin/audit-logs').then((r) => (r.ok ? r.json() : { logs: [] })),
    ])
      .then(([userData, issueData, itemData, auditData]) => {
        const users = userData.users || [];
        const issues = issueData.issues || [];
        const items = itemData.items || [];
        const logs = auditData.logs || [];

        const totalUsers = users.length;
        const resolvedIssues = issues.filter((i: any) => i.status === 'Resolved' || i.status === 'Verified').length;
        const lostItems = items.filter((i: any) => i.type === 'Lost').length;
        const returnedItems = items.filter((i: any) => i.status === 'Returned' || i.status === 'Claimed').length;

        // Calculate Category Breakdown
        const categories: Record<string, number> = {};
        issues.forEach((i: any) => {
          const cat = i.category || 'General';
          categories[cat] = (categories[cat] || 0) + 1;
        });

        const totalCatCount = issues.length || 1;
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
        const categoryBreakdown = Object.entries(categories).map(([category, count], idx) => ({
          category,
          percentage: Math.round((count / totalCatCount) * 100),
          color: colors[idx % colors.length],
        }));

        const recentActivity = logs.slice(0, 5).map((log: any) => ({
          id: log._id || log.id,
          title: log.actionType ? log.actionType.replace(/_/g, ' ') : 'System Action',
          details: log.entityType ? `${log.entityType}` : 'Audit event logged',
          timestamp: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: log.actionType?.includes('ISSUE') ? 'issue_new' : 'system',
        }));

        setStats({
          totalUsers,
          resolvedIssues,
          lostItems,
          returnedItems,
          categoryBreakdown,
          recentActivity,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            icon={<Users className="w-6 h-6 text-[#2563eb]" />}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            title="Resolved"
            count={stats.resolvedIssues}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            title="Lost Items"
            count={stats.lostItems}
            icon={<Package className="w-6 h-6 text-cyan-600" />}
            iconBgColor="bg-cyan-50"
          />
          <StatCard
            title="Returned"
            count={stats.returnedItems}
            icon={<RotateCcw className="w-6 h-6 text-purple-600" />}
            iconBgColor="bg-purple-50"
          />
        </div>

        {/* Main Grid: Categories & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issue Categories Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Issue Categories</h3>

            {loading ? (
              <p className="text-xs text-slate-400">Loading categories...</p>
            ) : stats.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400">No issue category data recorded yet.</p>
            ) : (
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
            )}
          </div>

          {/* Recent Activity Feed Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>

            {stats.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400">No recent activity logged.</p>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

