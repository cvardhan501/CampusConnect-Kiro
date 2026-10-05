'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { Bell, Calendar, User, RefreshCw, AlertTriangle } from 'lucide-react';

export default function NotificationsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/announcements', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to load notifications from server. Please try again.');
      }
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements(true);
  }, [loadAnnouncements]);

  const filtered = announcements.filter((a) => {
    const s = searchQuery.toLowerCase();
    return !searchQuery || a.title?.toLowerCase().includes(s) || a.content?.toLowerCase().includes(s) || a.category?.toLowerCase().includes(s);
  });

  return (
    <AppShell initialRole="student">
      <div className="space-y-6 select-none max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications & Updates</h1>
          <p className="text-sm text-slate-500 font-medium">Official campus announcements and operational updates.</p>
        </div>

        <SearchInput
          placeholder="Search notifications by title or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <LoadingState message="Loading notifications..." />
        ) : error && announcements.length === 0 ? (
          <EmptyState
            title="Unable to load notifications"
            description={error}
            icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
            action={
              <Button variant="outline" onClick={() => loadAnnouncements(true)} icon={<RefreshCw className="w-4 h-4" />}>
                Retry
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          searchQuery ? (
            <EmptyState
              title="No matching notifications"
              description="No notifications match your search query."
              icon={<Bell className="w-8 h-8 text-[#2563eb]" />}
              action={
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No notifications posted"
              description="Official campus notifications and updates will appear here."
              icon={<Bell className="w-8 h-8 text-[#2563eb]" />}
            />
          )
        ) : (
          <div className="space-y-4" role="feed" aria-label="Campus Notifications">
            {filtered.map((ann) => (
              <article
                key={ann._id || ann.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3"
                aria-label={`Notification: ${ann.title}`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2563eb] border border-blue-100">
                      {ann.category || 'General'}
                    </span>
                    {ann.priority === 'Urgent' && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200"
                        role="status"
                        aria-label="Priority: Urgent"
                      >
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                      {ann.author?.displayName || 'Administration'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      {ann.createdAt ? (
                        <time dateTime={new Date(ann.createdAt).toISOString()}>
                          {new Date(ann.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </time>
                      ) : (
                        'Recently'
                      )}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{ann.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
