'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Check, X, PackageCheck } from 'lucide-react';

export default function StaffClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = () => {
    fetch('/api/claims')
      .then((res) => (res.ok ? res.json() : { claims: [] }))
      .then((data) => {
        setClaims(data.claims || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAction = async (claimId: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/claims/${claimId}/${action}`, { method: 'POST' });
      fetchClaims();
    } catch {
      fetchClaims();
    }
  };

  return (
    <AppShell initialRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Pending Claims Verification</h1>
          <p className="text-sm text-slate-500 font-medium">Review submitted ownership proofs and approve item returns.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">Loading claims...</div>
        ) : claims.length === 0 ? (
          <EmptyState
            icon={<PackageCheck className="w-8 h-8" />}
            title="No Claims Pending"
            description="There are currently no ownership claims awaiting staff verification."
          />
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim._id || claim.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {claim.foundItemId?.title || claim.itemName || 'Found Item Claim'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Claimant: {claim.claimantId?.displayName || claim.claimedBy || 'User'} ({claim.claimantId?.email || claim.claimedByEmail || 'N/A'})
                    </p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Provided Evidence:</span>
                  <p className="text-slate-600">{claim.evidenceDescription || claim.proofDescription}</p>
                </div>

                {claim.status === 'Pending' && (
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<X className="w-4 h-4 text-red-600" />}
                      onClick={() => handleAction(claim._id || claim.id, 'reject')}
                    >
                      Reject Claim
                    </Button>
                    <Button
                      size="sm"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => handleAction(claim._id || claim.id, 'approve')}
                    >
                      Approve & Verify Return
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

