'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Activity, Clock } from 'lucide-react';

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch('/api/admin/activity', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'All') return true;
    return log.actionType === filterType;
  });

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6 select-none max-w-4xl mx-auto">
        {/* Header (Matching Screen #13) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Activity Log</h1>
            <p className="text-sm text-slate-500 font-medium">Track all system and user activities.</p>
          </div>
          <div className="w-48">
            <Select
              options={[
                { label: 'All Activities', value: 'All' },
                { label: 'Staff Assigned', value: 'STAFF_ASSIGNED' },
                { label: 'Status Changes', value: 'STATUS_CHANGED' },
                { label: 'New Issues', value: 'NEW_ISSUE_REPORTED' },
                { label: 'Registrations', value: 'USER_REGISTERED' },
              ]}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
        </div>

        {/* Content Container (Matching Screen #13) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          {loading ? (
            <div className="text-center text-xs text-slate-400 py-8 font-semibold">Loading activity history...</div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              title="No activity recorded"
              description="System activities and status changes will appear in this timeline."
              icon={<Activity className="w-8 h-8 text-[#2563eb]" />}
            />
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log._id || log.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60"
                >
                  <Avatar name={log.actingUserName || 'System'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">
                        {log.actingUserName || 'System User'}{' '}
                        <span className="font-normal text-slate-500">
                          ({log.actingUserRole || 'System'})
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold mt-1">
                      {log.actionType === 'STAFF_ASSIGNED'
                        ? `Staff assigned to request ${log.details?.ticketId || ''}`
                        : log.actionType === 'STATUS_CHANGED'
                        ? `Request ${log.details?.ticketId || ''} status changed to ${log.details?.to || ''}`
                        : log.actionType === 'NEW_ISSUE_REPORTED'
                        ? `New issue reported: "${log.details?.title || ''}"`
                        : log.actionType === 'USER_REGISTERED'
                        ? `New user registered: ${log.details?.email || ''}`
                        : log.actionType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
