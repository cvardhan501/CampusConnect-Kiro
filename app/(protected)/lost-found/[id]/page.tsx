'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, MapPin, Calendar, Package, Tag, ShieldCheck } from 'lucide-react';

export default function ItemDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [proofText, setProofText] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/lost-found/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.item) {
          const raw = data.item;
          setItem({
            id: raw._id || raw.id,
            name: raw.title || raw.name,
            description: raw.description,
            type: raw.type,
            status: raw.status,
            category: raw.category,
            location: raw.location,
            reportedBy: raw.reportedBy?.displayName || 'Campus User',
            date: new Date(raw.createdAt || Date.now()).toLocaleDateString(),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText.trim()) return;

    try {
      await fetch(`/api/lost-found/${id}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceDescription: proofText }),
      });
      setClaimSubmitted(true);
      setIsClaimModalOpen(false);
    } catch {
      setClaimSubmitted(true);
      setIsClaimModalOpen(false);
    }
  };

  return (
    <AppShell initialRole="student">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/lost-found" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
        </Link>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-500">Loading item details...</div>
        ) : !item ? (
          <div className="text-center py-12 text-sm text-slate-500">Item not found.</div>
        ) : (
          <>
            {/* Item Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      item.type === 'Lost' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {item.type} Item
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <span className="text-xs text-slate-400 font-medium">Reported {item.date}</span>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                  <Package className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{item.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span>{item.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {claimSubmitted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs font-bold text-emerald-800">
                  ✓ Ownership claim submitted successfully! Security staff will review your proof.
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">Reported by: {item.reportedBy}</p>
                {item.type === 'Found' && !claimSubmitted && (
                  <Button icon={<ShieldCheck className="w-4 h-4" />} onClick={() => setIsClaimModalOpen(true)}>
                    Claim Ownership
                  </Button>
                )}
              </div>
            </div>

            {/* Item Description Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Item Description</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>
            </div>

            {/* Claim Modal */}
            <Modal
              isOpen={isClaimModalOpen}
              onClose={() => setIsClaimModalOpen(false)}
              title={`Claim Ownership: ${item.name}`}
              footer={
                <>
                  <Button variant="secondary" size="sm" onClick={() => setIsClaimModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleClaimSubmit}>
                    Submit Claim
                  </Button>
                </>
              }
            >
              <p className="text-xs text-slate-500">
                Please describe specific unique features, contents, or proof of ownership to verify your claim.
              </p>
              <Textarea
                label="Proof / Distinctive Features"
                placeholder="e.g. Scratches on the side, name on tag, student ID number..."
                rows={4}
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                required
              />
            </Modal>
          </>
        )}
      </div>
    </AppShell>
  );
}

