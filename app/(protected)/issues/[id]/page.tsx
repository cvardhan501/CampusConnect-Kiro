'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, MapPin, Calendar, User, Wrench, CheckCircle2 } from 'lucide-react';
import { DEMO_ISSUES, DemoIssue } from '@/lib/demo-data';

export default function IssueDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const issue: DemoIssue = DEMO_ISSUES.find((i) => i.id === id) || DEMO_ISSUES[0];

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Robert Taylor (Staff)',
      text: 'Inspected the unit. Capacitor needs replacement, part ordered.',
      time: 'Apr 24, 2025 - 11:30 AM',
    },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: `c_${Date.now()}`,
        author: 'Vishnu (Student)',
        text: commentText,
        time: 'Just now',
      },
    ]);
    setCommentText('');
  };

  return (
    <AppShell initialRole="student">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Back Link */}
        <Link href="/issues" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Issues
        </Link>

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
              <span>{issue.building} • {issue.room}</span>
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
            {comments.map((c) => (
              <div key={c.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{c.author}</span>
                  <span className="text-[11px] text-slate-400">{c.time}</span>
                </div>
                <p className="text-xs text-slate-600">{c.text}</p>
              </div>
            ))}
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
      </div>
    </AppShell>
  );
}
