'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { IssueCard } from '@/components/ui/IssueCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Wrench } from 'lucide-react';

export default function MyIssuesPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchIssues() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user?.id) {
            const res = await fetch(`/api/issues?reporterId=${meData.user.id}`);
            if (res.ok) {
              const data = await res.json();
              const fetchedIssues = Array.isArray(data.issues) ? data.issues : Array.isArray(data) ? data : [];
              setIssues(fetchedIssues);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch issues:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
    intervalId = setInterval(fetchIssues, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Reported', label: 'Reported' },
    { id: 'In_Progress', label: 'In Progress' },
    { id: 'Resolved', label: 'Resolved' },
    { id: 'Verified', label: 'Verified' },
  ];

  const filteredIssues = issues.filter((issue) => {
    const matchesTab =
      activeTab === 'All' ||
      issue.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = issue.title?.toLowerCase().includes(searchLower);
    const categoryMatch = issue.category?.toLowerCase().includes(searchLower);
    const locationMatch = issue.location?.toLowerCase().includes(searchLower);
    const matchesSearch = !searchQuery || titleMatch || categoryMatch || locationMatch;
    return matchesTab && matchesSearch;
  });

  return (
    <AppShell initialRole="student">
      <div className="space-y-6">
        {/* Header with Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Issues</h1>
            <p className="text-sm text-slate-500 font-medium">Track and monitor all your submitted campus issues.</p>
          </div>
          <Link href="/issues/new">
            <Button icon={<Plus className="w-4 h-4" />}>Report Issue</Button>
          </Link>
        </div>

        {/* Main Content Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          {/* Tabs Bar */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underlined" />

          {/* Search Input */}
          <SearchInput
            placeholder="Search my issues by title, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Issue List */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-xs text-slate-400 py-8">Loading issues...</p>
            ) : filteredIssues.length === 0 ? (
              <EmptyState
                title="No issues reported yet"
                description="Report a campus issue and track its progress here."
                icon={<Wrench className="w-8 h-8 text-[#2563eb]" />}
                action={
                  <Link href="/issues/new">
                    <Button icon={<Plus className="w-4 h-4" />}>Report Issue</Button>
                  </Link>
                }
              />
            ) : (
              filteredIssues.map((issue) => <IssueCard key={issue._id || issue.id} issue={issue} />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
