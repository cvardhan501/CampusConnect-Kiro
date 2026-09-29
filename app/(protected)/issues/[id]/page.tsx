'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, MapPin, Calendar, User, Wrench, CheckCircle2 } from 'lucide-react';

export default function IssueDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/issues/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.issue) {
          const raw = data.issue;
          setIssue({
            id: raw._id || raw.id,
            issueNumber: raw.issueNumber || `ISS-${(raw._id || '').slice(-4).toUpperCase()}`,
            title: raw.title,
            description: raw.description,
            status: raw.status,
            priority: raw.priority,
            category: raw.category,
            building: raw.building || raw.location || 'Main Campus',
            room: raw.room || '',
            reportedBy: raw.reporter?.displayName || raw.reportedBy || 'Campus User',
            createdAt: new Date(raw.createdAt).toLocaleDateString(),
            resolutionNotes: raw.resolutionNotes,
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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
            author: 'You',
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

  return (
    <AppShell initialRole="student">
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
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-4">
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

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{issue.building} {issue.room ? `• ${issue.room}` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <span>{issue.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Reported by {issue.reportedBy}</span>
                </div>
              </div>
            </div>

            {/* Description Body Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Issue Details</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{issue.description}</p>
            </div>

            {/* Resolution Notes (if resolved) */}
            {issue.resolutionNotes && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Resolution Summary</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">{issue.resolutionNotes}</p>
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

