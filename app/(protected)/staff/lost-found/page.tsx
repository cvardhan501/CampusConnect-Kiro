'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { LostFoundCard } from '@/components/ui/LostFoundCard';
import { DEMO_LOST_FOUND_ITEMS } from '@/lib/demo-data';

export default function StaffLostFoundPage() {
  return (
    <AppShell initialRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Lost & Found Management</h1>
          <p className="text-sm text-slate-500 font-medium">Log found items, manage storage, and verify claims.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            {DEMO_LOST_FOUND_ITEMS.map((item) => (
              <LostFoundCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
