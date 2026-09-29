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
import { Wrench, UserCheck, Shield, ChevronRight, User, MapPin, Calendar } from 'lucide-react';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchQueueData = async () => {
    try {
      const [issuesRes, staffRes] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/admin/users?role=Staff'),
      ]);

      if (issuesRes.ok) {
        const data = await issuesRes.json();
        setIssues(data.issues || []);
      }
      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaffUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load queue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignStaff = async (issueId: string, staffUserId: string) => {
    if (!staffUserId) return;
    setAssigningId(issueId);
    try {
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffUserId }),
      });

      if (res.ok) {
        await fetchQueueData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign staff member');
      }
    } catch (err) {
      alert('Error assigning staff member');
    } finally {
      setAssigningId(null);
    }
  };

  const tabs = [
    { id: 'All', label: 'All Problems' },
    { id: 'Unassigned', label: 'Unassigned' },
    { id: 'Verification', label: 'Verification' },
    { id: 'In_Progress', label: 'Work in Process' },
    { id: 'Completed', label: 'Completed' },
  ];

  const filteredIssues = issues.filter((issue) => {
    const isUnassigned = !issue.assignedTo;
    const isVerification = ['Reported', 'Under_Review', 'Assigned'].includes(issue.status);
    const isInProgress = issue.status === 'In_Progress';
    const isCompleted = ['Resolved', 'Verified'].includes(issue.status);

    let matchesTab = true;
    if (activeTab === 'Unassigned') matchesTab = isUnassigned;
    else if (activeTab === 'Verification') matchesTab = isVerification;
    else if (activeTab === 'In_Progress') matchesTab = isInProgress;
    else if (activeTab === 'Completed') matchesTab = isCompleted;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      issue.title?.toLowerCase().includes(q) ||
      issue.location?.toLowerCase().includes(q) ||
      issue.category?.toLowerCase().includes(q) ||
      issue.reporter?.displayName?.toLowerCase().includes(q) ||
      issue.assignedTo?.displayName?.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <AppShell initialRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Master Issue Management</h1>
          <p className="text-sm text-slate-500 font-medium">Review, assign, and monitor facility problems across campus.</p>
        </div>

        {/* Staff Members Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" /> Staff Directory & Workload
            </h3>
            <span className="text-xs text-slate-500 font-medium">{staffUsers.length} Active Staff</span>
          </div>

          {staffUsers.length === 0 ? (
            <p className="text-xs text-slate-400">No staff members found in User database.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {staffUsers.map((staff) => {
                const assignedCount = issues.filter(
                  (i) =>
                    i.assignedTo &&
                    (i.assignedTo._id === staff._id || i.assignedTo === staff._id) &&
                    !['Resolved', 'Verified'].includes(i.status)
                ).length;

                return (
                  <div key={staff._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{staff.displayName}</h4>
                      <p className="text-[11px] text-slate-500">{staff.department || 'Maintenance'} • {staff.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${assignedCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {assignedCount > 0 ? `${assignedCount} Active Tasks` : 'Available'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Issues Queue Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underlined" />

          <SearchInput
            placeholder="Search problems by title, location, category, reporter, or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <div className="text-center py-12 text-sm text-slate-500">Loading master issue queue...</div>
          ) : filteredIssues.length === 0 ? (
            <EmptyState
              icon={<Wrench className="w-8 h-8 text-blue-600" />}
              title="No Issues Found"
              description="No campus problems match the current filter."
            />
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => {
                const assignedStaffName = issue.assignedTo?.displayName || 'Unassigned';

                return (
                  <div
                    key={issue._id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 transition-all space-y-4 shadow-sm"
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
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          Assigned: {assignedStaffName}
                        </span>
                      </div>

                      {/* Admin Staff Assignment Selector */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Assign Staff:</label>
                        <select
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={issue.assignedTo?._id || issue.assignedTo || ''}
                          disabled={assigningId === issue._id}
                          onChange={(e) => handleAssignStaff(issue._id, e.target.value)}
                        >
                          <option value="">[ Select Staff ▼ ]</option>
                          {staffUsers.map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.displayName} ({staff.department || 'Staff'})
                            </option>
                          ))}
                        </select>

                        <Link href={`/issues/${issue._id}`}>
                          <Button size="sm" variant="secondary">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}


