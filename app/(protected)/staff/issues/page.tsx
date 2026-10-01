'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { RequestCard } from '@/components/ui/RequestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { ClipboardList, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StaffMyWorkPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [workList, setWorkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMyWork = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/issues', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to load assigned tasks. Please try again.');
      }
      const data = await res.json();
      setWorkList(data.issues || []);
    } catch (err: any) {
      console.error('Failed to load staff work:', err);
      setError(err.message || 'Failed to load assigned work');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyWork(true);
  }, [loadMyWork]);

  const tabs = [
    { id: 'All', label: 'All', count: workList.length },
    {
      id: 'Verification',
      label: 'Verification',
      count: workList.filter((r) => ['Reported', 'Under_Review', 'Assigned'].includes(r.status)).length,
    },
    {
      id: 'In_Progress',
      label: 'In Progress',
      count: workList.filter((r) => r.status === 'In_Progress').length,
    },
    {
      id: 'Completed',
      label: 'Completed',
      count: workList.filter((r) => ['Resolved', 'Verified'].includes(r.status)).length,
    },
  ];

  const filtered = workList.filter((req) => {
    let matchesTab = true;
    if (activeTab === 'Verification') {
      matchesTab = ['Reported', 'Under_Review', 'Assigned'].includes(req.status);
    } else if (activeTab === 'In_Progress') {
      matchesTab = req.status === 'In_Progress';
    } else if (activeTab === 'Completed') {
      matchesTab = ['Resolved', 'Verified'].includes(req.status);
    }

    const s = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      req.title?.toLowerCase().includes(s) ||
      req.location?.toLowerCase().includes(s) ||
      req.ticketId?.toLowerCase().includes(s);

    return matchesTab && matchesSearch;
  });

  return (
    <AppShell initialRole="staff">
      <div className="space-y-6 select-none">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Work</h1>
          <p className="text-sm text-slate-500 font-medium">View and manage your assigned tasks.</p>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

          <SearchInput
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <LoadingState message="Loading assigned tasks..." />
          ) : error && workList.length === 0 ? (
            <EmptyState
              title="Failed to load tasks"
              description={error}
              icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
              action={
                <Button variant="outline" onClick={() => loadMyWork(true)} icon={<RefreshCw className="w-4 h-4" />}>
                  Retry
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            searchQuery || activeTab !== 'All' ? (
              <EmptyState
                title="No matching tasks"
                description="No assigned tasks match your current search or tab selection."
                icon={<ClipboardList className="w-8 h-8 text-[#2563eb]" />}
                action={
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveTab('All'); }}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No tasks found"
                description="Assigned tasks requiring verification or work in progress will be listed here."
                icon={<ClipboardList className="w-8 h-8 text-[#2563eb]" />}
              />
            )
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => (
                <RequestCard key={req._id || req.id} request={req} hrefPrefix="/staff/issues" showPriority />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

