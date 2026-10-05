'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { ArrowLeft, MapPin, Tag, Calendar, User, UserPlus, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function AdminRequestManagementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign Staff Modal State (Matching Screen #9)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('Facilities');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState<string | null>(null);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In_Progress');
  const [statusNote, setStatusNote] = useState('');

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('Attached Photos');

  useEffect(() => {
    async function loadAdminData() {
      setRequest(null);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/issues/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Request not found');
        }
        const data = await res.json();
        setRequest(data.issue);
        if (data.issue?.department || data.issue?.category) {
          setSelectedDept(data.issue.department || data.issue.category);
        }

        const staffRes = await fetch('/api/admin/users?role=Staff', { cache: 'no-store' });
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaffList(staffData.users || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load request');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadAdminData();
  }, [id]);

  const openLightbox = (images: any[], index: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  const handleAssignStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    setAssigning(true);
    setAssignError(null);
    setAssignSuccessMessage(null);

    try {
      const res = await fetch(`/api/issues/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaffId,
          note: assignNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Work assignment failed');
      }

      setRequest(data.issue);
      setAssignModalOpen(false);
      setAssignNote('');
      setAssignSuccessMessage('Staff assigned successfully');
      setTimeout(() => setAssignSuccessMessage(null), 5000);
    } catch (err: any) {
      setAssignError(err.message || 'Work assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      const data = await res.json();
      setRequest(data.issue);
      setStatusModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <AppShell initialRole="admin">
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading request details...</div>
      </AppShell>
    );
  }

  if (error || !request) {
    return (
      <AppShell initialRole="admin">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <p className="text-sm font-bold text-red-600">{error || 'Request not found'}</p>
          <Button variant="outline" onClick={() => router.push('/admin/issues')}>
            ← Back to All Requests
          </Button>
        </div>
      </AppShell>
    );
  }

  const ticketCode = request.ticketId || `CC-2026-${(request._id || '').slice(-5).toUpperCase()}`;

  return (
    <AppShell initialRole="admin">
      <div className="max-w-4xl mx-auto space-y-6 select-none">
        {/* Back Navigation (Matching Screen #8) */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/issues"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Requests</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold text-slate-400">{ticketCode}</span>
            <PriorityBadge priority={request.priority} />
          </div>
        </div>

        {assignSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>{assignSuccessMessage}</span>
          </div>
        )}

        {/* Request Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
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

          {/* Details Grid & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Main Info (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Description</h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 font-medium">
                  {request.description}
                </p>
              </div>

              {/* Student Photo Attachments */}
              {request.attachments && request.attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" />
                    Student Submitted Attachments ({request.attachments.length})
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

              {/* Activity Timeline */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Activity Log</h3>
                <div className="space-y-2">
                  {request.timeline?.map((t: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-900">{t.authorName} ({t.authorRole})</span>
                        <span className="text-[10px]">{new Date(t.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 font-semibold">{t.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Actions Panel (1 col - Matching Screen #8) */}
            <div className="space-y-4">
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Actions</h3>

                <Button
                  className="w-full justify-center"
                  icon={request.assignedTo ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <UserPlus className="w-4 h-4" />}
                  onClick={() => setAssignModalOpen(true)}
                  disabled={Boolean(request.assignedTo) || assigning}
                >
                  {request.assignedTo ? 'Work Assigned' : 'Assign Work'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-center"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => setStatusModalOpen(true)}
                >
                  Change Status
                </Button>
              </div>

              {/* Assigned Info */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Current Status:</span>
                  <div className="mt-1">
                    <StatusBadge status={request.status} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Assigned Department:</span>
                  <p className="font-bold text-slate-900">{request.department || request.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Assigned Staff:</span>
                  <p className="font-bold text-slate-900">
                    {request.assignedTo?.displayName || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screen #9: Assign Staff Modal */}
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title="Assign Staff"
          subtitle={`${ticketCode} - ${request.title}`}
        >
          <form onSubmit={handleAssignStaffSubmit} className="space-y-4">
            {assignError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {assignError}
              </div>
            )}

            <Select
              label="Department"
              options={[
                { label: 'Facilities', value: 'Facilities' },
                { label: 'IT Support', value: 'IT Support' },
                { label: 'Maintenance', value: 'Maintenance' },
                { label: 'Electrical', value: 'Electrical' },
                { label: 'Plumbing', value: 'Plumbing' },
              ]}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            />

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Staff Member
              </label>
              {staffList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No staff members registered.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {staffList
                    .filter((s) => !selectedDept || (s.department || 'Facilities').toLowerCase() === selectedDept.toLowerCase() || staffList.every(x => (x.department || 'Facilities').toLowerCase() !== selectedDept.toLowerCase()))
                    .map((s) => (
                      <label
                        key={s.id || s._id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedStaffId === (s.id || s._id)
                            ? 'border-[#2563eb] bg-blue-50/50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="staff"
                            value={s.id || s._id}
                            checked={selectedStaffId === (s.id || s._id)}
                            onChange={() => setSelectedStaffId(s.id || s._id)}
                            className="text-[#2563eb]"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{s.displayName}</p>
                            <p className="text-[10px] text-slate-500">{s.department || 'Facilities'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {s.activeTasks || 0} active
                        </span>
                      </label>
                    ))}
                </div>
              )}
            </div>

            <Textarea
              label="Add a Note (Optional)"
              placeholder="Provide context or instructions for staff..."
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              rows={2}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={assigning} disabled={!selectedStaffId}>
                Assign Staff
              </Button>
            </div>
          </form>
        </Modal>

        {/* Change Status Modal */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title="Change Status"
          subtitle={`Update status for ${ticketCode}`}
        >
          <form onSubmit={handleStatusChangeSubmit} className="space-y-4">
            <Select
              label="New Status"
              options={[
                { label: 'Verification (Reported)', value: 'Reported' },
                { label: 'Assigned', value: 'Assigned' },
                { label: 'Work in Process (In Progress)', value: 'In_Progress' },
                { label: 'Completed (Resolved)', value: 'Resolved' },
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />

            <Textarea
              label="Audit Note"
              placeholder="Reason for status change..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={assigning}>
                Update Status
              </Button>
            </div>
          </form>
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
