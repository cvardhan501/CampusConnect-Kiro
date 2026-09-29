'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { LostFoundCard } from '@/components/ui/LostFoundCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, PackageSearch, Package } from 'lucide-react';

export default function LostFoundDirectoryPage() {
  const [activeTab, setActiveTab] = useState('Lost Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLostFoundData() {
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          fetch('/api/lost-found'),
          fetch('/api/claims'),
        ]);

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          const fetchedItems = Array.isArray(itemsData.items)
            ? itemsData.items
            : Array.isArray(itemsData)
            ? itemsData
            : [];
          setItems(fetchedItems);
        }

        if (claimsRes.ok) {
          const claimsData = await claimsRes.json();
          const fetchedClaims = Array.isArray(claimsData.claims)
            ? claimsData.claims
            : Array.isArray(claimsData)
            ? claimsData
            : [];
          setClaims(fetchedClaims);
        }
      } catch (err) {
        console.error('Failed to load Lost & Found data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLostFoundData();
  }, []);

  const tabs = [
    { id: 'Lost Items', label: 'Lost Items' },
    { id: 'Found Items', label: 'Found Items' },
    { id: 'My Claims', label: 'My Claims' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeTab === 'Lost Items' && item.type !== 'Lost') return false;
    if (activeTab === 'Found Items' && item.type !== 'Found') return false;
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(searchLower) || item.name?.toLowerCase().includes(searchLower);
    const locationMatch = item.location?.toLowerCase().includes(searchLower);
    const categoryMatch = item.category?.toLowerCase().includes(searchLower);
    return !searchQuery || titleMatch || locationMatch || categoryMatch;
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
              {loading ? (
                <p className="text-center text-xs text-slate-400 py-8">Loading claims...</p>
              ) : claims.length === 0 ? (
                <EmptyState
                  title="No active claims"
                  description="You have not submitted any ownership claims yet."
                  icon={<Package className="w-8 h-8 text-cyan-600" />}
                />
              ) : (
                claims.map((claim) => (
                  <div key={claim._id || claim.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">
                        {claim.foundItemId?.title || claim.itemName || 'Found Item Claim'}
                      </h4>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl font-medium">
                      <span className="font-bold text-slate-700">Submitted Proof:</span> {claim.ownershipEvidence || claim.proofDescription}
                    </p>
                    <p className="text-[11px] text-slate-400">Claim ID: {claim._id || claim.id}</p>
                  </div>
                ))
              )}
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
                {loading ? (
                  <p className="text-center text-xs text-slate-400 py-8">Loading Lost & Found items...</p>
                ) : filteredItems.length === 0 ? (
                  <EmptyState
                    title="No active Lost & Found items"
                    description={`No ${activeTab.toLowerCase()} match your current search.`}
                    icon={<PackageSearch className="w-8 h-8 text-cyan-600" />}
                  />
                ) : (
                  filteredItems.map((item) => <LostFoundCard key={item._id || item.id} item={item} />)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
