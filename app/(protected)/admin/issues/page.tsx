'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { IssueCard } from '@/components/ui/IssueCard';
import { DEMO_ISSUES } from '@/lib/demo-data';

export default function AdminIssuesPage() {
  return (
    <AppShell initialRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Master Issue Management</h1>
          <p className="text-sm text-slate-500 font-medium">Global issue tracking and resolution management across all campus buildings.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            {DEMO_ISSUES.map((issue) => (
              <IssueCard key={issue.id} issue={issue} showPriority />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
