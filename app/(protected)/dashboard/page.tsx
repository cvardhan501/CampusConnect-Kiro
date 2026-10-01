'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { RequestCard } from '@/components/ui/RequestCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Plus, ClipboardList, PackageSearch, Megaphone, ArrowRight, Wrench, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [lostFound, setLostFound] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentData = useCallback(async (isInitial = false) => {
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
        throw new Error('Failed to load student dashboard data.');
      }
      const issuesData = await issuesRes.json();
      setRequests(issuesData.issues || []);

      const lfRes = await fetch('/api/lost-found', { cache: 'no-store' });
      if (lfRes.ok) {
        const lfData = await lfRes.json();
        setLostFound((lfData.items || []).slice(0, 3));
      }

      const annRes = await fetch('/api/announcements', { cache: 'no-store' });
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements((annData.announcements || []).slice(0, 2));
      }
    } catch (err: any) {
      console.error('Failed to load student dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentData(true);
  }, [loadStudentData]);

  const displayName = user?.displayName || 'Student';
  const activeCount = requests.filter((r) =>
    ['Reported', 'Under_Review', 'Assigned', 'In_Progress'].includes(r.status)
  ).length;
  const completedCount = requests.filter((r) => ['Resolved', 'Verified'].includes(r.status)).length;

  return (
    <AppShell initialRole="student">
      <div className="space-y-8 select-none">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1727] text-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Campus Operations v2
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Good morning, {displayName} 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Report issues around campus, check lost & found items, and track your request resolutions live.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Link href="/issues/new">
              <Button size="lg" icon={<Plus className="w-5 h-5" />}>
                Report New Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Submitted"
            value={requests.length}
            icon={<ClipboardList className="w-6 h-6 text-[#2563eb]" />}
            badgeColor="blue"
          />
          <StatCard
            label="Active Requests"
            value={activeCount}
            icon={<Wrench className="w-6 h-6 text-amber-600" />}
            badgeColor="amber"
          />
          <StatCard
            label="Completed Resolutions"
            value={completedCount}
            icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
            badgeColor="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Recent Requests - 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Recent Requests</h2>
              <Link
                href="/issues"
                className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <LoadingState message="Loading dashboard requests..." />
            ) : error && requests.length === 0 ? (
              <EmptyState
                title="Failed to load dashboard data"
                description={error}
                icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
                action={
                  <Button variant="outline" onClick={() => loadStudentData(true)} icon={<RefreshCw className="w-4 h-4" />}>
                    Retry
                  </Button>
                }
              />
            ) : requests.length === 0 ? (
              <EmptyState
                title="No active requests"
                description="Everything looks good! Report an issue if something needs attention."
                icon={<Wrench className="w-8 h-8 text-[#2563eb]" />}
                action={
                  <Link href="/issues/new">
                    <Button icon={<Plus className="w-4 h-4" />}>Report Issue</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 4).map((req) => (
                  <RequestCard key={req._id || req.id} request={req} hrefPrefix="/issues" />
                ))}
              </div>
            )}
          </div>

          {/* Right Column (Campus Updates & Lost & Found - 1 col) */}
          <div className="space-y-6">
            {/* Campus Updates Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#2563eb]" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Campus Updates
                  </h3>
                </div>
                <Link href="/announcements" className="text-xs font-bold text-[#2563eb] hover:underline">
                  All
                </Link>
              </div>

              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No campus announcements.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann._id || ann.id} className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{ann.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lost & Found Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PackageSearch className="w-4 h-4 text-[#2563eb]" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Lost & Found
                  </h3>
                </div>
                <Link href="/lost-found" className="text-xs font-bold text-[#2563eb] hover:underline">
                  Browse
                </Link>
              </div>

              {lostFound.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No items listed yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {lostFound.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.location}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'Found'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.type}
                      </span>
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
