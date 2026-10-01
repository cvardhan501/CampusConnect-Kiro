'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { RequestCard } from '@/components/ui/RequestCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ClipboardList, Wrench, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function StaffDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [assignedWork, setAssignedWork] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaffOverview = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }

      const issuesRes = await fetch('/api/issues', { cache: 'no-store' });
      if (!issuesRes.ok) {
        throw new Error('Failed to load assigned staff tasks.');
      }
      const data = await issuesRes.json();
      setAssignedWork(data.issues || []);
    } catch (err: any) {
      console.error('Failed to load staff overview:', err);
      setError(err.message || 'Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffOverview(true);
  }, [loadStaffOverview]);

  const displayName = user?.displayName || 'Staff Member';
  const assignedCount = assignedWork.filter((r) => ['Assigned', 'Reported', 'Under_Review'].includes(r.status)).length;
  const inProgressCount = assignedWork.filter((r) => r.status === 'In_Progress').length;
  const urgentCount = assignedWork.filter((r) => r.priority === 'High' || r.priority === 'Critical').length;

  return (
    <AppShell initialRole="staff">
      <div className="space-y-8 select-none">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {displayName} 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium">Here's your work for today.</p>
        </div>

        {/* 3 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Assigned"
            value={assignedCount}
            icon={<ClipboardList className="w-6 h-6 text-[#2563eb]" />}
            badgeColor="blue"
          />
          <StatCard
            label="In-Progress"
            value={inProgressCount}
            icon={<Wrench className="w-6 h-6 text-emerald-600" />}
            badgeColor="green"
          />
          <StatCard
            label="Urgent"
            value={urgentCount}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            badgeColor="red"
          />
        </div>

        {/* Today's Work Section Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Today's Work</h2>
            <Link
              href="/staff/issues"
              className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Loading assigned tasks..." />
          ) : error && assignedWork.length === 0 ? (
            <EmptyState
              title="Failed to load tasks"
              description={error}
              icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
              action={
                <Button variant="outline" onClick={() => loadStaffOverview(true)} icon={<RefreshCw className="w-4 h-4" />}>
                  Retry
                </Button>
              }
            />
          ) : assignedWork.length === 0 ? (
            <EmptyState
              title="No tasks assigned"
              description="Tasks assigned to your department will appear here for review and verification."
              icon={<ClipboardList className="w-8 h-8 text-[#2563eb]" />}
            />
          ) : (
            <div className="space-y-3">
              {assignedWork.map((req) => (
                <RequestCard key={req._id || req.id} request={req} hrefPrefix="/staff/issues" showPriority />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

