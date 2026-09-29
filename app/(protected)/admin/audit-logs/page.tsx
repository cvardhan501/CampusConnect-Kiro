'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShieldAlert } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => (res.ok ? res.json() : { logs: [] }))
      .then((data) => {
        const rawLogs = data.logs || data.data || [];
        const mapped = rawLogs.map((log: any) => ({
          id: log._id || log.id,
          actor: log.userId?.displayName || log.actor || 'System',
          role: log.userId?.role || log.role || 'System',
          action: log.actionType || log.action,
          target: log.details || log.entityType || log.target || 'General',
          timestamp: new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString(),
          ipAddress: log.ipAddress || '127.0.0.1',
        }));
        setLogs(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<any>[] = [
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

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">Loading system audit logs...</div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="w-8 h-8" />}
            title="No Audit Logs Found"
            description="There are currently no recorded audit logs in the system."
          />
        ) : (
          <DataTable columns={columns} data={logs} />
        )}
      </div>
    </AppShell>
  );
}

