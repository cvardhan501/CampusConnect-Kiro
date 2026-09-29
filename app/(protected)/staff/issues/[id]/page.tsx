'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { IAttachment } from '@/server/models/Issue';
import { ArrowLeft, MapPin, Tag, Calendar, User, CheckCircle2, MessageSquare, Wrench, Image as ImageIcon } from 'lucide-react';

export default function StaffWorkDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals / Action states
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionPhotos, setResolutionPhotos] = useState<IAttachment[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('Attached Photos');

  useEffect(() => {
    async function loadRequest() {
      try {
        const res = await fetch(`/api/issues/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Task not found or not assigned to you');
        }
        const data = await res.json();
        setRequest(data.issue);
      } catch (err: any) {
        setError(err.message || 'Failed to load work details');
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

  const handleUpdateStatus = async (newStatus: string, note?: string, resNote?: string, resPhotos?: IAttachment[]) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note,
          resolutionNote: resNote,
          resolutionPhotos: resPhotos,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update task status');
      }

      const data = await res.json();
      setRequest(data.issue);
      setNoteModalOpen(false);
      setResolutionModalOpen(false);
      setNoteText('');
      setResolutionText('');
      setResolutionPhotos([]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell initialRole="staff">
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading task details...</div>
      </AppShell>
    );
  }

  if (error || !request) {
    return (
      <AppShell initialRole="staff">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <p className="text-sm font-bold text-red-600">{error || 'Task details unavailable'}</p>
          <Button variant="outline" onClick={() => router.push('/staff/issues')}>
            ← Back to My Work
          </Button>
        </div>
      </AppShell>
    );
  }

  const ticketCode = request.ticketId || `CC-2026-${(request._id || '').slice(-5).toUpperCase()}`;
  const isVerification = ['Reported', 'Under_Review', 'Assigned'].includes(request.status);
  const isInProgress = request.status === 'In_Progress';
  const isCompleted = ['Resolved', 'Verified'].includes(request.status);

  return (
    <AppShell initialRole="staff">
      <div className="max-w-3xl mx-auto space-y-6 select-none">
        {/* Top Header Navigation matching Screens #3, #4, #5 */}
        <div className="flex items-center justify-between">
          <Link
            href="/staff/issues"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Work</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold text-slate-400">{ticketCode}</span>
            <PriorityBadge priority={request.priority} />
          </div>
        </div>

        {/* Main Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">{request.title}</h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{request.location}</span>
                <span>•</span>
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>{request.category}</span>
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          {/* Stepper Status Timeline (Matching Screens #3, #4, #5) */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Work Stepper</p>
            <StatusTimeline currentStatus={request.status} />
          </div>

          {/* Request Details Card Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Request Details</h3>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-slate-400 font-medium">Reported by:</span>
                <p className="font-bold text-slate-900">{request.reporter?.displayName || 'Student'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Reported on:</span>
                <p className="font-bold text-slate-900">{new Date(request.createdAt).toLocaleString()}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-medium">Description:</span>
                <p className="font-semibold text-slate-800 mt-1 leading-relaxed">{request.description}</p>
              </div>
            </div>
          </div>

          {/* Student Submitted Attachment Gallery */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" />
                Student Submitted Photos ({request.attachments.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {request.attachments.map((att: any, idx: number) => (
                  <div
                    key={att.publicId || idx}
                    onClick={() => openLightbox(request.attachments, idx, 'Student Attachments')}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer hover:border-[#2563eb] transition-all shadow-2xs"
                  >
                    <img
                      src={att.thumbnailUrl || att.url}
                      alt={att.fileName || `Attachment ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Evidence Photos */}
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
                    onClick={() => openLightbox(request.resolutionPhotos, idx, 'Completion Photos')}
                    className="relative group rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50 aspect-square cursor-pointer hover:border-emerald-500 transition-all shadow-2xs"
                  >
                    <img
                      src={att.thumbnailUrl || att.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline & Notes Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Work Timeline & Notes</h3>
            {request.timeline?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
            ) : (
              <div className="space-y-2">
                {request.timeline?.map((t: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span className="font-bold text-slate-900">{t.authorName} ({t.authorRole})</span>
                      <span className="text-[10px]">{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 font-semibold">{t.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolution Note display if completed (Screen #5) */}
          {request.resolutionNote && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Resolution Summary</h4>
              </div>
              <p className="text-xs font-semibold text-emerald-800">{request.resolutionNote}</p>
            </div>
          )}

          {/* Bottom Action Bar (Matching Screens #3, #4, #5) */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={() => setNoteModalOpen(true)}
            >
              Add Note / Update
            </Button>

            {isVerification && (
              <Button
                icon={<Wrench className="w-4 h-4" />}
                loading={actionLoading}
                onClick={() => handleUpdateStatus('In_Progress', 'Work started on request.')}
              >
                Mark as Verified & Start Work
              </Button>
            )}

            {isInProgress && (
              <Button
                icon={<CheckCircle2 className="w-4 h-4" />}
                loading={actionLoading}
                onClick={() => setResolutionModalOpen(true)}
              >
                Mark as Completed
              </Button>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Work Completed
              </div>
            )}
          </div>
        </div>

        {/* Add Note Modal */}
        <Modal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          title="Add Work Note"
          subtitle={`Add progress update for ${ticketCode}`}
        >
          <div className="space-y-4">
            <Textarea
              label="Work Note"
              placeholder="Describe progress or details..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              required
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                loading={actionLoading}
                disabled={!noteText.trim()}
                onClick={() => handleUpdateStatus(request.status, noteText)}
              >
                Save Note
              </Button>
            </div>
          </div>
        </Modal>

        {/* Complete Work Resolution Modal (Screen #5) */}
        <Modal
          isOpen={resolutionModalOpen}
          onClose={() => setResolutionModalOpen(false)}
          title="Complete Work Request"
          subtitle={`Provide resolution details and photos for ${ticketCode}`}
        >
          <div className="space-y-4">
            <Textarea
              label="Resolution Note"
              placeholder="Explain how the issue was fixed or resolved..."
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              rows={3}
              required
            />

            <ImageUploader
              label="Attach Completion Evidence Photos (Optional)"
              value={resolutionPhotos}
              onChange={setResolutionPhotos}
              maxFiles={4}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setResolutionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                loading={actionLoading}
                disabled={!resolutionText.trim()}
                onClick={() => handleUpdateStatus('Resolved', undefined, resolutionText, resolutionPhotos)}
              >
                Mark Completed
              </Button>
            </div>
          </div>
        </Modal>
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
