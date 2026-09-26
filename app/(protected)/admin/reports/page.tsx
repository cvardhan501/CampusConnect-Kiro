'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { FileText, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const reports = [
    { id: 'r1', name: 'Monthly Campus Maintenance & Resolution Summary', date: 'Apr 2025', size: '2.4 MB' },
    { id: 'r2', name: 'Lost & Found Inventory & Returns Audit', date: 'Apr 2025', size: '1.8 MB' },
    { id: 'r3', name: 'AI Triage Accuracy & Severity Analysis Report', date: 'Q1 2025', size: '3.1 MB' },
  ];

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Export Reports</h1>
          <p className="text-sm text-slate-500 font-medium">Download aggregated CSV and PDF campus governance reports.</p>
        </div>

        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{r.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{r.date} • {r.size}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                Export PDF
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
