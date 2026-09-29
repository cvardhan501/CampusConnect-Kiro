'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';

export default function AdminAllRequestsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllRequests() {
      try {
        const res = await fetch('/api/issues', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setRequests(data.issues || []);
        }
      } catch (err) {
        console.error('Failed to load all requests:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAllRequests();
  }, []);

  const tabs = [
    { id: 'All', label: 'All', count: requests.length },
    {
      id: 'Pending',
      label: 'Pending',
      count: requests.filter((r) => ['Reported', 'Under_Review'].includes(r.status)).length,
    },
    {
      id: 'Active',
      label: 'Active',
      count: requests.filter((r) => ['Assigned', 'In_Progress'].includes(r.status)).length,
    },
    {
      id: 'Completed',
      label: 'Completed',
      count: requests.filter((r) => ['Resolved', 'Verified'].includes(r.status)).length,
    },
  ];

  const filtered = requests.filter((req) => {
    let matchesTab = true;
    if (activeTab === 'Pending') {
      matchesTab = ['Reported', 'Under_Review'].includes(req.status);
    } else if (activeTab === 'Active') {
      matchesTab = ['Assigned', 'In_Progress'].includes(req.status);
    } else if (activeTab === 'Completed') {
      matchesTab = ['Resolved', 'Verified'].includes(req.status);
    }

    const s = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      req.title?.toLowerCase().includes(s) ||
      req.location?.toLowerCase().includes(s) ||
      req.ticketId?.toLowerCase().includes(s) ||
      req.category?.toLowerCase().includes(s);

    return matchesTab && matchesSearch;
  });

  const columns: Column<any>[] = [
    {
      header: 'ID',
      cell: (r) => (
        <span className="font-mono font-bold text-slate-500">
          {r.ticketId || `CC-2026-${(r._id || '').slice(-5).toUpperCase()}`}
        </span>
      ),
    },
    {
      header: 'Title',
      cell: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.title}</p>
          <p className="text-[10px] text-slate-400 font-medium">{r.location}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (r) => <span className="font-semibold text-slate-700">{r.category}</span>,
    },
    {
      header: 'Priority',
      cell: (r) => <PriorityBadge priority={r.priority} />,
    },
    {
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Date',
      cell: (r) => (
        <span className="text-slate-500 font-medium">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (r) => (
        <Link href={`/admin/issues/${r._id || r.id}`}>
          <Button size="sm" variant="outline">
            Manage
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6 select-none">
        {/* Header (Matching Screen #7) */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">All Requests</h1>
          <p className="text-sm text-slate-500 font-medium">View and manage all campus requests.</p>
        </div>

        {/* Card Container (Matching Screen #7) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

          <SearchInput
            placeholder="Search all requests by ID, title, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <div className="text-center text-xs text-slate-400 py-8 font-semibold">Loading requests table...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(r) => r._id || r.id}
              emptyMessage="No requests match the selected filter."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
