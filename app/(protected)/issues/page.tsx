'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { IssueCard } from '@/components/ui/IssueCard';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { DEMO_ISSUES } from '@/lib/demo-data';

export default function MyIssuesPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Open', label: 'Open' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Resolved', label: 'Resolved' },
    { id: 'Closed', label: 'Closed' },
  ];

  const filteredIssues = DEMO_ISSUES.filter((issue) => {
    const matchesTab = activeTab === 'All' || issue.status === activeTab;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase());
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
            {filteredIssues.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">No issues found matching your criteria.</p>
            ) : (
              filteredIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
