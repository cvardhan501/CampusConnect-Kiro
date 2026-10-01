'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { RequestCard } from '@/components/ui/RequestCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Plus, Wrench, RefreshCw, AlertTriangle } from 'lucide-react';

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyRequests = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/issues', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) {
        throw new Error('Failed to load requests from server. Please try again.');
      }
      const data = await res.json();
      setRequests(data.issues || []);
    } catch (err: any) {
      console.error('Failed to fetch my requests:', err);
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRequests(true);
    const intervalId = setInterval(() => fetchMyRequests(false), 10000);
    return () => clearInterval(intervalId);
  }, [fetchMyRequests]);

  const tabs = [
    { id: 'All', label: 'All Requests', count: requests.length },
    {
      id: 'Verification',
      label: 'Verification',
      count: requests.filter((r) => ['Reported', 'Under_Review', 'Assigned'].includes(r.status)).length,
    },
    {
      id: 'In_Progress',
      label: 'Work in Process',
      count: requests.filter((r) => r.status === 'In_Progress').length,
    },
    {
      id: 'Completed',
      label: 'Completed',
      count: requests.filter((r) => ['Resolved', 'Verified'].includes(r.status)).length,
    },
  ];

  const filteredRequests = requests.filter((req) => {
    let matchesTab = true;
    if (activeTab === 'Verification') {
      matchesTab = ['Reported', 'Under_Review', 'Assigned'].includes(req.status);
    } else if (activeTab === 'In_Progress') {
      matchesTab = req.status === 'In_Progress';
    } else if (activeTab === 'Completed') {
      matchesTab = ['Resolved', 'Verified'].includes(req.status);
    }

    const searchLower = searchQuery.toLowerCase();
    const titleMatch = req.title?.toLowerCase().includes(searchLower);
    const categoryMatch = req.category?.toLowerCase().includes(searchLower);
    const locationMatch = req.location?.toLowerCase().includes(searchLower);
    const matchesSearch = !searchQuery || titleMatch || categoryMatch || locationMatch;

    return matchesTab && matchesSearch;
  });

  return (
    <AppShell initialRole="student">
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Requests</h1>
            <p className="text-sm text-slate-500 font-medium">Track and monitor all your submitted campus requests.</p>
          </div>
          <Link href="/issues/new">
            <Button icon={<Plus className="w-4 h-4" />}>Report Issue</Button>
          </Link>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

          <SearchInput
            placeholder="Search my requests by title, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="space-y-3">
            {loading ? (
              <LoadingState message="Loading your requests..." />
            ) : error && requests.length === 0 ? (
              <EmptyState
                title="Failed to load requests"
                description={error}
                icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
                action={
                  <Button variant="outline" onClick={() => fetchMyRequests(true)} icon={<RefreshCw className="w-4 h-4" />}>
                    Retry
                  </Button>
                }
              />
            ) : filteredRequests.length === 0 ? (
              searchQuery || activeTab !== 'All' ? (
                <EmptyState
                  title="No matching requests"
                  description="No requests match your current search or tab selection."
                  icon={<Wrench className="w-8 h-8 text-[#2563eb]" />}
                  action={
                    <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveTab('All'); }}>
                      Clear Filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  title="No requests found"
                  description="Report a campus issue to track its status and resolution timeline here."
                  icon={<Wrench className="w-8 h-8 text-[#2563eb]" />}
                  action={
                    <Link href="/issues/new">
                      <Button icon={<Plus className="w-4 h-4" />}>Report Issue</Button>
                    </Link>
                  }
                />
              )
            ) : (
              filteredRequests.map((req) => <RequestCard key={req._id || req.id} request={req} hrefPrefix="/issues" />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

