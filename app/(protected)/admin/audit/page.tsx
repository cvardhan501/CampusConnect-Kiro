'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#2563eb]" />
          <span>System Audit Logs</span>
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Immutable security event and action tracking history.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No audit logs recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actionType}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2563eb] border border-blue-100">
                      {log.entityType}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    User: {log.actingUserId?.displayName || 'System'} ({log.actingUserId?.email || 'N/A'})
                  </div>
                  {log.details && (
                    <div className="text-slate-400 text-[11px] mt-0.5 font-mono">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
                <div className="text-slate-400 text-[11px] font-medium whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
