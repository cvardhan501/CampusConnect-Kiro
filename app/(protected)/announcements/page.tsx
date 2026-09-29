'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Megaphone, Calendar, User } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch('/api/announcements', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, []);

  const filtered = announcements.filter((a) => {
    const s = searchQuery.toLowerCase();
    return !searchQuery || a.title?.toLowerCase().includes(s) || a.content?.toLowerCase().includes(s);
  });

  return (
    <AppShell initialRole="student">
      <div className="space-y-6 select-none max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Campus Updates</h1>
          <p className="text-sm text-slate-500 font-medium">Official announcements and operational news.</p>
        </div>

        <SearchInput
          placeholder="Search updates by title or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-8">Loading updates...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No announcements posted"
            description="Official campus announcements will be posted here."
            icon={<Megaphone className="w-8 h-8 text-[#2563eb]" />}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((ann) => (
              <div
                key={ann._id || ann.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2563eb] border border-blue-100">
                      {ann.category || 'General'}
                    </span>
                    {ann.priority === 'Urgent' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {ann.author?.displayName || 'Administration'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{ann.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
