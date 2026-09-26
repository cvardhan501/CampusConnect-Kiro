'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { IssueCard } from '@/components/ui/IssueCard';
import { ClipboardCheck, CheckCircle2, PackageCheck } from 'lucide-react';
import { DEMO_ISSUES } from '@/lib/demo-data';

export default function StaffDashboardPage() {
  const assignedIssues = DEMO_ISSUES.slice(0, 3);

  return (
    <AppShell initialRole="staff">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Staff Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your assigned tasks and campus claims.</p>
        </div>

        {/* 3 Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Assigned Issues"
            count={12}
            icon={<ClipboardCheck className="w-6 h-6 text-[#2563eb]" />}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            title="Found Items"
            count={8}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            title="Pending Claims"
            count={3}
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

          <div className="space-y-3">
            {assignedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} showPriority />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
