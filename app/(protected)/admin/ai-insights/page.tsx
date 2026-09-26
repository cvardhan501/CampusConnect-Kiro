'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Sparkles, AlertTriangle, Layers, Zap } from 'lucide-react';

export default function AdminAIInsightsPage() {
  return (
    <AppShell initialRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">AI Triage & Insights</h1>
          <p className="text-sm text-slate-500 font-medium">Automated duplicate detection, auto-categorization accuracy, and severity monitoring.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Auto-Categorized" count="96.4%" trendText="+2%" icon={<Sparkles className="w-6 h-6 text-[#2563eb]" />} iconBgColor="bg-blue-50" />
          <StatCard title="Duplicates Flagged" count="18" trendText=">= 0.85" icon={<Layers className="w-6 h-6 text-purple-600" />} iconBgColor="bg-purple-50" />
          <StatCard title="Severity-5 Alerts" count="2" trendText="Critical" icon={<AlertTriangle className="w-6 h-6 text-red-600" />} iconBgColor="bg-red-50" />
          <StatCard title="AI Match Rate" count="91.2%" trendText="+5%" icon={<Zap className="w-6 h-6 text-amber-600" />} iconBgColor="bg-amber-50" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Recent AI Flagged Duplicates</h3>
          <div className="space-y-3">
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-amber-900 block">Issue #1024 (AC not cooling)</span>
                <span className="text-amber-700">Flagged 89% similarity to existing Issue #1018 in Block C - Room 204.</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-bold text-amber-800 shrink-0">
                Similarity: 0.89
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
