'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/ui/DataTable';
import { DEMO_AUDIT_LOGS, DemoAuditLog } from '@/lib/demo-data';

export default function AdminAuditLogsPage() {
  const columns: Column<DemoAuditLog>[] = [
    {
      header: 'Actor',
      cell: (log) => (
        <div>
          <span className="block font-bold text-slate-900 text-xs">{log.actor}</span>
          <span className="block text-[10px] text-slate-400">{log.role}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      cell: (log) => (
        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {log.action}
        </span>
      ),
    },
    {
      header: 'Target Details',
      cell: (log) => <span className="text-xs text-slate-700 font-medium">{log.target}</span>,
    },
    {
      header: 'Timestamp',
      cell: (log) => <span className="text-xs text-slate-500">{log.timestamp}</span>,
    },
    {
      header: 'IP Address',
      cell: (log) => <span className="font-mono text-xs text-slate-400">{log.ipAddress}</span>,
    },
  ];

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-500 font-medium">Security event trail, admin actions, and system modification logs.</p>
        </div>

        <DataTable columns={columns} data={DEMO_AUDIT_LOGS} />
      </div>
    </AppShell>
  );
}
