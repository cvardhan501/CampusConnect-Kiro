'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { Button } from '@/components/ui/Button';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { ArrowLeft, MapPin, Tag, Calendar, User, Building, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('Attached Photos');

  useEffect(() => {
    async function loadRequest() {
      try {
        const res = await fetch(`/api/issues/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Request not found or access denied');
        }
        const data = await res.json();
        setRequest(data.issue);
      } catch (err: any) {
        setError(err.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadRequest();
  }, [id]);

  const openLightbox = (images: any[], index: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <AppShell initialRole="student">
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading request details...</div>
      </AppShell>
    );
  }

  if (error || !request) {
    return (
      <AppShell initialRole="student">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <p className="text-sm font-bold text-red-600">{error || 'Request not found'}</p>
          <Button variant="outline" onClick={() => router.push('/issues')}>
            ← Back to My Requests
          </Button>
        </div>
      </AppShell>
    );
  }

  const ticketCode = request.ticketId || `CC-2026-${(request._id || '').slice(-5).toUpperCase()}`;

  return (
    <AppShell initialRole="student">
      <div className="max-w-3xl mx-auto space-y-6 select-none">
        {/* Back Link */}
        <Link
          href="/issues"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Requests</span>
        </Link>

        {/* Header Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-extrabold text-slate-400">{ticketCode}</span>
              <PriorityBadge priority={request.priority} />
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">{request.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {request.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {request.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(request.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stepper Status Timeline */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Live Progress</p>
            <StatusTimeline currentStatus={request.status} />
          </div>

          {/* Description Section */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Request Description</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 font-medium">
              {request.description}
            </p>
          </div>

          {/* Submitted Photo Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" />
                Attached Photos ({request.attachments.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {request.attachments.map((att: any, idx: number) => (
                  <div
                    key={att.publicId || idx}
                    onClick={() => openLightbox(request.attachments, idx, 'Student Reported Photos')}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer hover:border-[#2563eb] transition-all shadow-2xs"
                  >
                    <img
                      src={att.thumbnailUrl || att.url}
                      alt={att.fileName || `Attachment ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion / Resolution Evidence Photos */}
          {request.resolutionPhotos && request.resolutionPhotos.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Work Completion Evidence ({request.resolutionPhotos.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {request.resolutionPhotos.map((att: any, idx: number) => (
                  <div
                    key={att.publicId || idx}
                    onClick={() => openLightbox(request.resolutionPhotos, idx, 'Staff Completion Evidence')}
                    className="relative group rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50 aspect-square cursor-pointer hover:border-emerald-500 transition-all shadow-2xs"
                  >
                    <img
                      src={att.thumbnailUrl || att.url}
                      alt={att.fileName || `Resolution photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Note if completed */}
          {request.resolutionNote && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Resolution Note</h4>
              </div>
              <p className="text-xs font-semibold text-emerald-800">{request.resolutionNote}</p>
            </div>
          )}

          {/* Assignment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
              <User className="w-5 h-5 text-[#2563eb]" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reporter</p>
                <p className="text-xs font-bold text-slate-900">{request.reporter?.displayName || 'You'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
              <Building className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Staff</p>
                <p className="text-xs font-bold text-slate-900">
                  {request.assignedTo?.displayName
                    ? `${request.assignedTo.displayName} (${request.department || 'Staff'})`
                    : 'Awaiting Assignment'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        attachments={lightboxImages}
        initialIndex={lightboxIndex}
        title={lightboxTitle}
      />
    </AppShell>
  );
}
