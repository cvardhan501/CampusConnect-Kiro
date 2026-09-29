'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { LostFoundCard } from '@/components/ui/LostFoundCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

export default function AdminLostFoundPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lost-found')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const mapped = (data.items || []).map((raw: any) => ({
          id: raw._id || raw.id,
          name: raw.title || raw.name,
          description: raw.description,
          type: raw.type,
          status: raw.status,
          category: raw.category,
          location: raw.location,
          reportedBy: raw.reportedBy?.displayName || 'Campus User',
          date: new Date(raw.createdAt || Date.now()).toLocaleDateString(),
        }));
        setItems(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Master Lost & Found Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Overview of all lost belongings, found logs, and active claims.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">Loading master directory...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No Items Found"
            description="There are currently no items logged in the master Lost & Found directory."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              {items.map((item) => (
                <LostFoundCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

