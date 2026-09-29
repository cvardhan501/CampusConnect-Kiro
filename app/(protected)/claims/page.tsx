'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PackageCheck } from 'lucide-react';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/claims')
      .then((res) => (res.ok ? res.json() : { claims: [] }))
      .then((data) => {
        setClaims(data.claims || []);
      })
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell initialRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Claims</h1>
          <p className="text-sm text-slate-500 font-medium">Track your submitted ownership verification claims.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">Loading claims...</div>
        ) : claims.length === 0 ? (
          <EmptyState
            icon={<PackageCheck className="w-8 h-8" />}
            title="No Ownership Claims Found"
            description="You have not submitted any ownership claims for found items yet."
          />
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim._id || claim.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {claim.foundItemId?.title || claim.itemName || 'Found Item Claim'}
                  </h3>
                  <StatusBadge status={claim.status} />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Submitted Evidence:</span>
                  <p className="text-slate-600">{claim.proofDescription || claim.evidenceDescription}</p>
                </div>
                <p className="text-xs text-slate-400">
                  Claim ID: {claim._id || claim.id} • Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

