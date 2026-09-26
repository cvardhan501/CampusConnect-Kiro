'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Check, X } from 'lucide-react';
import { DEMO_CLAIMS } from '@/lib/demo-data';

export default function StaffClaimsPage() {
  return (
    <AppShell initialRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Pending Claims Verification</h1>
          <p className="text-sm text-slate-500 font-medium">Review submitted ownership proofs and approve item returns.</p>
        </div>

        <div className="space-y-4">
          {DEMO_CLAIMS.map((claim) => (
            <div key={claim.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{claim.itemName}</h3>
                  <p className="text-xs text-slate-500">Claimant: {claim.claimedBy} ({claim.claimedByEmail})</p>
                </div>
                <StatusBadge status={claim.status} />
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Provided Evidence:</span>
                <p className="text-slate-600">{claim.proofDescription}</p>
              </div>

              {claim.status === 'Pending' && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" icon={<X className="w-4 h-4 text-red-600" />}>
                    Reject Claim
                  </Button>
                  <Button size="sm" icon={<Check className="w-4 h-4" />}>
                    Approve & Verify Return
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
