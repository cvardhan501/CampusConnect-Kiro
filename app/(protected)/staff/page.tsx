'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { IssueCard } from '@/components/ui/IssueCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardCheck, CheckCircle2, PackageCheck, Wrench } from 'lucide-react';
import { LastUpdatedIndicator } from '@/components/ui/LastUpdatedIndicator';

export default function StaffDashboardPage() {
  const [assignedIssues, setAssignedIssues] = useState<any[]>([]);
  const [stats, setStats] = useState({ assigned: 0, foundItems: 0, pendingClaims: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/issues').then((res) => (res.ok ? res.json() : { issues: [] })),
      fetch('/api/lost-found').then((res) => (res.ok ? res.json() : { items: [] })),
      fetch('/api/claims').then((res) => (res.ok ? res.json() : { claims: [] })),
    ])
      .then(([issuesData, itemsData, claimsData]) => {
        const issues = issuesData.issues || [];
        const items = itemsData.items || [];
        const claims = claimsData.claims || [];

        const mappedIssues = issues.map((raw: any) => ({
          id: raw._id || raw.id,
          issueNumber: raw.issueNumber || `ISS-${(raw._id || '').slice(-4).toUpperCase()}`,
          title: raw.title,
          description: raw.description,
          status: raw.status,
          priority: raw.priority,
          category: raw.category,
          building: raw.building || raw.location || 'Main Campus',
          room: raw.room || '',
          reportedBy: raw.reporter?.displayName || raw.reportedBy || 'Campus User',
          createdAt: new Date(raw.createdAt).toLocaleDateString(),
        }));

        setAssignedIssues(mappedIssues);
        setStats({
          assigned: issues.length,
          foundItems: items.filter((i: any) => i.type === 'Found').length,
          pendingClaims: claims.filter((c: any) => c.status === 'Pending').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell initialRole="staff">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Staff Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your assigned tasks and campus claims.</p>
          </div>
          <LastUpdatedIndicator />
        </div>

        {/* 3 Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Assigned Issues"
            count={stats.assigned}
            icon={<ClipboardCheck className="w-6 h-6 text-[#2563eb]" />}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            title="Found Items"
            count={stats.foundItems}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            title="Pending Claims"
            count={stats.pendingClaims}
            icon={<PackageCheck className="w-6 h-6 text-amber-600" />}
            iconBgColor="bg-amber-50"
          />
        </div>

        {/* Section: Recent Assigned Issues */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Assigned Issues</h2>
            <Link href="/staff/issues" className="text-xs font-bold text-[#2563eb] hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm text-slate-500">Loading assigned tasks...</div>
          ) : assignedIssues.length === 0 ? (
            <EmptyState
              icon={<Wrench className="w-8 h-8" />}
              title="No Assigned Issues"
              description="There are currently no maintenance or facility issues assigned to your staff scope."
            />
          ) : (
            <div className="space-y-3">
              {assignedIssues.slice(0, 5).map((issue) => (
                <IssueCard key={issue.id} issue={issue} showPriority />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

