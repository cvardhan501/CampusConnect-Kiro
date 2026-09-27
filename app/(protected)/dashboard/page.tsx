'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Wrench, Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import { IssueCard } from '@/components/ui/IssueCard';
import { LastUpdatedIndicator } from '@/components/ui/LastUpdatedIndicator';
import { DEMO_ISSUES } from '@/lib/demo-data';

export default function StudentDashboardPage() {
  const recentIssues = DEMO_ISSUES.slice(0, 3);

  return (
    <AppShell initialRole="student">
      <div className="space-y-8">
        {/* Top Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good Morning, Vishnu
            </h1>
            <p className="text-sm text-slate-500 font-medium">Welcome back to CampusConnect</p>
          </div>
          <LastUpdatedIndicator />
        </div>

        {/* 2-Column Quick Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Report Issue */}
          <Link
            href="/issues/new"
            className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                  Report Issue
                </h3>
                <p className="text-xs text-slate-500 font-medium">Fix campus problems</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Action 2: Lost & Found */}
          <Link
            href="/lost-found"
            className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#06b6d4] text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#06b6d4] transition-colors">
                  Lost & Found
                </h3>
                <p className="text-xs text-slate-500 font-medium">Find or report lost items</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#06b6d4] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Section 1: My Issues */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">My Issues</h2>
            <Link href="/issues" className="text-xs font-bold text-[#2563eb] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>

        {/* Section 2: Recent Updates */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Updates</h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Your issue #1023 has been resolved</p>
              <p className="text-xs text-slate-400 font-medium">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
