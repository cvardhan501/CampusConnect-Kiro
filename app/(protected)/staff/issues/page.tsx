'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { Wrench, PlayCircle, CheckCircle2, MapPin, User } from 'lucide-react';

export default function StaffAssignedIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStaffIssues = async () => {
    try {
      const res = await fetch('/api/issues');
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error('Failed to fetch assigned staff issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffIssues();
    const interval = setInterval(fetchStaffIssues, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartWork = async (issueId: string) => {
    setUpdatingId(issueId);
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In_Progress' }),
      });

      if (res.ok) {
        await fetchStaffIssues();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to start work');
      }
    } catch {
      alert('Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkCompleted = async (issueId: string) => {
    const note = prompt(
      'Enter a brief resolution note for this issue (at least 20 characters):',
      'Maintenance work completed and verified on site.'
    );
    if (note === null) return;
    if (note.trim().length < 20) {
      alert('Resolution note must be at least 20 characters.');
      return;
    }

    setUpdatingId(issueId);
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved', resolutionNote: note.trim() }),
      });

      if (res.ok) {
        await fetchStaffIssues();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to complete issue');
      }
    } catch {
      alert('Error completing issue');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { id: 'All', label: 'All Assigned Tasks' },
    { id: 'Verification', label: 'Verification' },
    { id: 'In_Progress', label: 'Work in Process' },
    { id: 'Completed', label: 'Completed' },
  ];

  const filteredIssues = issues.filter((issue) => {
    const isVerification = ['Reported', 'Under_Review', 'Assigned'].includes(issue.status);
    const isInProgress = issue.status === 'In_Progress';
    const isCompleted = ['Resolved', 'Verified'].includes(issue.status);

    let matchesTab = true;
    if (activeTab === 'Verification') matchesTab = isVerification;
    else if (activeTab === 'In_Progress') matchesTab = isInProgress;
    else if (activeTab === 'Completed') matchesTab = isCompleted;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      issue.title?.toLowerCase().includes(q) ||
      issue.location?.toLowerCase().includes(q) ||
      issue.category?.toLowerCase().includes(q) ||
      issue.reporter?.displayName?.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <AppShell initialRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Issues</h1>
          <p className="text-sm text-slate-500 font-medium">Review and update status on maintenance issues assigned to you.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underlined" />

          <SearchInput
            placeholder="Search assigned tasks by title, location, category, or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <div className="text-center py-12 text-sm text-slate-500">Loading issues...</div>
          ) : filteredIssues.length === 0 ? (
            <EmptyState
              icon={<Wrench className="w-8 h-8 text-blue-600" />}
              title="No Issues Found"
              description="There are currently no maintenance issues assigned to your staff scope in this category."
            />
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-4 hover:border-blue-200 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={issue.status} />
                      <PriorityBadge priority={issue.priority} />
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {issue.category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Reported {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">{issue.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{issue.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500 font-medium">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {issue.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Reporter: {issue.reporter?.displayName || 'Student'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {['Reported', 'Under_Review', 'Assigned'].includes(issue.status) && (
                        <Button
                          size="sm"
                          disabled={updatingId === issue._id}
                          onClick={() => handleStartWork(issue._id)}
                          icon={<PlayCircle className="w-4 h-4" />}
                        >
                          {updatingId === issue._id ? 'Updating...' : 'Start Work'}
                        </Button>
                      )}

                      {issue.status === 'In_Progress' && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={updatingId === issue._id}
                          onClick={() => handleMarkCompleted(issue._id)}
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          {updatingId === issue._id ? 'Updating...' : 'Mark Completed'}
                        </Button>
                      )}

                      {['Resolved', 'Verified'].includes(issue.status) && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                        </span>
                      )}

                      <Link href={`/issues/${issue._id}`}>
                        <Button size="sm" variant="secondary">
                          View Details
                        </Button>
                      </Link>
                    </div>
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


