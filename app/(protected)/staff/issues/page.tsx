'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { RequestCard } from '@/components/ui/RequestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

export default function StaffMyWorkPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [workList, setWorkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyWork() {
      try {
        const res = await fetch('/api/issues', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setWorkList(data.issues || []);
        }
      } catch (err) {
        console.error('Failed to load staff work:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMyWork();
  }, []);

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
        {/* Page Header (Matching Screen #2) */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Work</h1>
          <p className="text-sm text-slate-500 font-medium">View and manage your assigned tasks.</p>
        </div>

        {/* Content Container (Matching Screen #2) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

          <SearchInput
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <div className="text-center text-xs text-slate-400 py-8 font-semibold">Loading assigned tasks...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description="Assigned tasks requiring verification or work in progress will be listed here."
              icon={<ClipboardList className="w-8 h-8 text-[#2563eb]" />}
            />
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
