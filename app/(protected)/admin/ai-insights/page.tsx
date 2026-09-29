'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Sparkles, AlertTriangle, Layers, Zap } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminAIInsightsPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then((res) => (res.ok ? res.json() : { issues: [] }))
      .then((data) => setIssues(data.issues || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categorizedCount = issues.filter((i) => i.category && i.category !== 'General').length;
  const autoCategorizedPct = issues.length > 0 ? Math.round((categorizedCount / issues.length) * 100) : 100;
  const duplicates = issues.filter((i) => i.aiTriage?.duplicateOf || i.duplicateOf || i.isDuplicate);
  const criticalAlerts = issues.filter((i) => i.priority === 'Critical' || i.priority === 'High').length;

  return (
    <AppShell initialRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">AI Triage & Insights</h1>
          <p className="text-sm text-slate-500 font-medium">Automated duplicate detection, auto-categorization accuracy, and severity monitoring.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Auto-Categorized" count={`${autoCategorizedPct}%`} trendText="Accuracy" icon={<Sparkles className="w-6 h-6 text-[#2563eb]" />} iconBgColor="bg-blue-50" />
          <StatCard title="Duplicates Flagged" count={duplicates.length} trendText="System Total" icon={<Layers className="w-6 h-6 text-purple-600" />} iconBgColor="bg-purple-50" />
          <StatCard title="High Priority Alerts" count={criticalAlerts} trendText="Requires Action" icon={<AlertTriangle className="w-6 h-6 text-red-600" />} iconBgColor="bg-red-50" />
          <StatCard title="Total Issues Analyzed" count={issues.length} trendText="Live DB Count" icon={<Zap className="w-6 h-6 text-amber-600" />} iconBgColor="bg-amber-50" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Recent AI Flagged Duplicates</h3>
          {loading ? (
            <p className="text-xs text-slate-400">Loading AI triage data...</p>
          ) : duplicates.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-8 h-8 text-slate-400" />}
              title="No Duplicates Flagged"
              description="No duplicate campus issues detected in current active submissions."
            />
          ) : (
            <div className="space-y-3">
              {duplicates.map((issue) => (
                <div key={issue._id || issue.id} className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-amber-900 block">{issue.title}</span>
                    <span className="text-amber-700">Category: {issue.category} • Location: {issue.location || 'Campus'}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-bold text-amber-800 shrink-0">
                    Priority: {issue.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
