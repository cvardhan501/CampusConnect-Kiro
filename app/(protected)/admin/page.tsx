'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardList, Clock, Wrench, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
  });
  const [attentionRequests, setAttentionRequests] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminOverview() {
      try {
        const issuesRes = await fetch('/api/issues', { cache: 'no-store' });
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          const all = issuesData.issues || [];

          setStats({
            total: all.length,
            pending: all.filter((r: any) => ['Reported', 'Under_Review'].includes(r.status)).length,
            active: all.filter((r: any) => ['Assigned', 'In_Progress'].includes(r.status)).length,
            completed: all.filter((r: any) => ['Resolved', 'Verified'].includes(r.status)).length,
          });

          // Requests requiring attention (High/Critical priority or unassigned pending)
          const urgent = all.filter((r: any) =>
            ['Reported', 'Under_Review', 'Assigned'].includes(r.status)
          );
          setAttentionRequests(urgent.slice(0, 4));
        }

        const staffRes = await fetch('/api/admin/users?role=Staff', { cache: 'no-store' });
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaffList((staffData.users || []).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminOverview();
  }, []);

  return (
    <AppShell initialRole="admin">
      <div className="space-y-8 select-none">
        {/* Page Header (Matching Screen #6) */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Campus Operations</h1>
          <p className="text-sm text-slate-500 font-medium">Here's what's happening across the campus.</p>
        </div>

        {/* 4 Stat Cards Row (Matching Screen #6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Requests"
            value={stats.total}
            icon={<ClipboardList className="w-6 h-6 text-[#2563eb]" />}
            badgeColor="blue"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={<Clock className="w-6 h-6 text-amber-600" />}
            badgeColor="amber"
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={<Wrench className="w-6 h-6 text-emerald-600" />}
            badgeColor="green"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
            badgeColor="blue"
          />
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requests Requiring Attention (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Requests Requiring Attention</h2>
              <Link href="/admin/issues" className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">Loading operations data...</div>
            ) : attentionRequests.length === 0 ? (
              <EmptyState
                title="No pending reviews"
                description="All reported requests are reviewed and assigned."
                icon={<ShieldCheck className="w-8 h-8 text-emerald-600" />}
              />
            ) : (
              <div className="space-y-3">
                {attentionRequests.map((req) => (
                  <div
                    key={req._id || req.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{req.title}</h4>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {req.ticketId || `CC-2026-${(req._id || '').slice(-5).toUpperCase()}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {req.location} • {req.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <PriorityBadge priority={req.priority} />
                      <Link href={`/admin/issues/${req._id || req.id}`}>
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff Workload Column (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Staff Workload</h2>
              <Link href="/admin/users" className="text-xs font-bold text-[#2563eb] hover:underline">
                Manage Staff
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              {staffList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No staff members configured.</p>
              ) : (
                <div className="space-y-3">
                  {staffList.map((s) => (
                    <div key={s.id || s._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{s.displayName} ({s.department || 'Facilities'})</span>
                        <span className="font-bold text-slate-500">{s.activeTasks || 0} tasks</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#2563eb] h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(((s.activeTasks || 0) / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
