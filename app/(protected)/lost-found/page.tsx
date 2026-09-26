'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { LostFoundCard } from '@/components/ui/LostFoundCard';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { DEMO_LOST_FOUND_ITEMS, DEMO_CLAIMS } from '@/lib/demo-data';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function LostFoundDirectoryPage() {
  const [activeTab, setActiveTab] = useState('Lost Items');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'Lost Items', label: 'Lost Items' },
    { id: 'Found Items', label: 'Found Items' },
    { id: 'My Claims', label: 'My Claims' },
  ];

  const filteredItems = DEMO_LOST_FOUND_ITEMS.filter((item) => {
    if (activeTab === 'Lost Items' && item.type !== 'Lost') return false;
    if (activeTab === 'Found Items' && item.type !== 'Found') return false;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppShell initialRole="student">
      <div className="space-y-6">
        {/* Header with Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Lost & Found</h1>
            <p className="text-sm text-slate-500 font-medium">Browse lost belongings or report found items on campus.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/lost-found/report-lost">
              <Button icon={<Plus className="w-4 h-4" />}>Report Lost</Button>
            </Link>
            <Link href="/lost-found/report-found">
              <Button variant="outline" icon={<Plus className="w-4 h-4" />}>Report Found</Button>
            </Link>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          {/* Tabs Bar */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underlined" />

          {/* Content based on Active Tab */}
          {activeTab === 'My Claims' ? (
            <div className="space-y-4">
              {DEMO_CLAIMS.map((claim) => (
                <div key={claim.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{claim.itemName}</h4>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl font-medium">
                    <span className="font-bold text-slate-700">Submitted Proof:</span> {claim.proofDescription}
                  </p>
                  <p className="text-[11px] text-slate-400">Claimed on {claim.createdAt}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Bar */}
              <SearchInput
                placeholder={`Search ${activeTab.toLowerCase()} by name, location, or category...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Items List */}
              <div className="space-y-3">
                {filteredItems.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">No items found matching your search.</p>
                ) : (
                  filteredItems.map((item) => <LostFoundCard key={item.id} item={item} />)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
