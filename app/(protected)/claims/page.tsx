'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEMO_CLAIMS } from '@/lib/demo-data';

export default function ClaimsPage() {
  return (
    <AppShell initialRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Claims</h1>
          <p className="text-sm text-slate-500 font-medium">Track your submitted ownership verification claims.</p>
        </div>

        <div className="space-y-4">
          {DEMO_CLAIMS.map((claim) => (
            <div key={claim.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{claim.itemName}</h3>
                <StatusBadge status={claim.status} />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Submitted Evidence:</span>
                <p className="text-slate-600">{claim.proofDescription}</p>
              </div>
              <p className="text-xs text-slate-400">Claim ID: {claim.id} • Submitted on {claim.createdAt}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
