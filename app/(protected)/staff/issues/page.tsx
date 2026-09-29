'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { IssueCard } from '@/components/ui/IssueCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Wrench } from 'lucide-react';

export default function StaffAssignedIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then((res) => (res.ok ? res.json() : { issues: [] }))
      .then((data) => {
        const mapped = (data.issues || []).map((raw: any) => ({
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
        setIssues(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell initialRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Issues</h1>
          <p className="text-sm text-slate-500 font-medium">Review and update status on maintenance issues assigned to you.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">Loading issues...</div>
        ) : issues.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-8 h-8" />}
            title="No Issues Found"
            description="There are currently no maintenance issues assigned or reported."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} showPriority />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

