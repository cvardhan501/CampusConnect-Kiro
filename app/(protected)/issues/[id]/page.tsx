'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, MapPin, Calendar, User, Wrench, CheckCircle2, UserCheck, PlayCircle, Clock } from 'lucide-react';

export default function IssueDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [issue, setIssue] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const fetchIssueData = async () => {
    if (!id) return;
    try {
      const [issueRes, meRes] = await Promise.all([
        fetch(`/api/issues/${id}`),
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (meRes?.user) {
        setCurrentUser(meRes.user);
      }

      if (issueRes.ok) {
        const data = await issueRes.json();
        if (data?.issue) {
          const raw = data.issue;
          setIssue({
            _id: raw._id || raw.id,
            issueNumber: raw.issueNumber || `ISS-${(raw._id || '').slice(-4).toUpperCase()}`,
            title: raw.title,
            description: raw.description,
            status: raw.status,
            priority: raw.priority,
            category: raw.category,
            location: raw.location || `${raw.building || ''} ${raw.room || ''}`.trim() || 'Main Campus',
            reporter: raw.reporter,
            assignedTo: raw.assignedTo,
            createdAt: new Date(raw.createdAt).toLocaleDateString(),
            resolutionNote: raw.resolutionNote || raw.resolutionNotes,
          });
          if (raw.comments) {
            setComments(
              raw.comments.map((c: any) => ({
                id: c._id || c.id,
                author: c.author?.displayName || 'User',
                text: c.comment || c.text,
                time: new Date(c.createdAt || Date.now()).toLocaleString(),
              }))
            );
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch issue details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueData();
  }, [id]);

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In_Progress' }),
      });
      if (res.ok) await fetchIssueData();
      else alert('Failed to update status');
    } catch {
      alert('Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    const note = prompt(
      'Enter resolution summary for this issue (at least 20 characters):',
      'Maintenance work completed and verified on site.'
    );
    if (note === null) return;
    if (note.trim().length < 20) {
      alert('Resolution note must be at least 20 characters.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved', resolutionNote: note.trim() }),
      });
      if (res.ok) await fetchIssueData();
      else alert('Failed to complete issue');
    } catch {
      alert('Error completing issue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyResolution = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Verified' }),
      });
      if (res.ok) await fetchIssueData();
      else alert('Failed to verify resolution');
    } catch {
      alert('Error verifying resolution');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenIssue = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reported' }),
      });
      if (res.ok) await fetchIssueData();
      else alert('Failed to reopen issue');
    } catch {
      alert('Error reopening issue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/issues/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentText }),
      });
      if (res.ok) {
        setComments([
          ...comments,
          {
            id: `c_${Date.now()}`,
            author: currentUser?.displayName || 'You',
            text: commentText,
            time: 'Just now',
          },
        ]);
        setCommentText('');
      }
    } catch {
      // client update fallback
    }
  };

  // Timeline Step calculation
  const statusStepMap: Record<string, number> = {
    Reported: 1,
    Under_Review: 2,
    Assigned: 2,
    In_Progress: 3,
    Resolved: 4,
    Verified: 4,
  };
  const currentStep = issue ? statusStepMap[issue.status] || 1 : 1;

  const isStaffAssigned =
    currentUser?.role === 'Staff' &&
    issue?.assignedTo &&
    (issue.assignedTo._id === currentUser.id || issue.assignedTo === currentUser.id);

  const isSubmitterStudent =
    currentUser?.role === 'Student' &&
    issue?.reporter &&
    (issue.reporter._id === currentUser.id || issue.reporter === currentUser.id);

  return (
    <AppShell initialRole={currentUser?.role?.toLowerCase() || 'student'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Back Link */}
        <Link href="/issues" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Issues
        </Link>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">Loading issue details...</div>
        ) : !issue ? (
          <div className="text-center py-12 text-sm text-slate-500">Issue not found.</div>
        ) : (
          <>
            {/* Header Title & Badges Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {issue.issueNumber}
                  </span>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </div>
                <span className="text-xs text-slate-400 font-medium">Reported {issue.createdAt}</span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{issue.title}</h1>

              {/* Workflow Step Timeline Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Issue Progress Timeline</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                  <div className={`p-2 rounded-lg border ${currentStep >= 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-400'}`}>
                    ✓ Reported
                  </div>
                  <div className={`p-2 rounded-lg border ${currentStep >= 2 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {currentStep >= 2 ? '✓ Verification' : 'Verification'}
                  </div>
                  <div className={`p-2 rounded-lg border ${currentStep >= 3 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {currentStep >= 3 ? '✓ Work in Process' : 'Work in Process'}
                  </div>
                  <div className={`p-2 rounded-lg border ${currentStep >= 4 ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {currentStep >= 4 ? '✓ Completed' : 'Completed'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{issue.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <span>{issue.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Reported by {issue.reporter?.displayName || 'Student'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Assigned to: {issue.assignedTo?.displayName || 'Waiting for assignment'}</span>
                </div>
              </div>

              {/* Role Action Controls */}
              {isStaffAssigned && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  {['Reported', 'Under_Review', 'Assigned'].includes(issue.status) && (
                    <Button onClick={handleStartWork} disabled={actionLoading} icon={<PlayCircle className="w-4 h-4" />}>
                      {actionLoading ? 'Updating...' : 'Start Work (Move to Work in Process)'}
                    </Button>
                  )}
                  {issue.status === 'In_Progress' && (
                    <Button onClick={handleMarkCompleted} disabled={actionLoading} icon={<CheckCircle2 className="w-4 h-4" />}>
                      {actionLoading ? 'Updating...' : 'Mark Completed'}
                    </Button>
                  )}
                </div>
              )}

              {isSubmitterStudent && issue.status === 'Resolved' && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Button onClick={handleVerifyResolution} disabled={actionLoading} icon={<CheckCircle2 className="w-4 h-4" />}>
                    Verify & Confirm Resolution
                  </Button>
                  <Button variant="secondary" onClick={handleReopenIssue} disabled={actionLoading}>
                    Reopen Issue
                  </Button>
                </div>
              )}
            </div>

            {/* Description Body Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Issue Details</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{issue.description}</p>
            </div>

            {/* Resolution Note */}
            {issue.resolutionNote && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Resolution Summary</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">{issue.resolutionNote}</p>
              </div>
            )}

            {/* Activity & Comments Feed */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900">Activity & Comments</h3>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400">No comments yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{c.author}</span>
                        <span className="text-[11px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-slate-100">
                <Textarea
                  placeholder="Add a comment or follow-up note..."
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm">
                    Post Comment
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}


