'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { UploadDropzone } from '@/components/ui/UploadDropzone';

export default function ReportIssuePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = [
    { label: 'Select category', value: '' },
    { label: 'AC / Ventilation', value: 'AC / HVAC' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Wi-Fi / Network', value: 'IT / Network' },
    { label: 'Plumbing', value: 'Plumbing' },
    { label: 'Electrical', value: 'Electrical' },
    { label: 'General Maintenance', value: 'General' },
  ];

  const buildingOptions = [
    { label: 'Select building', value: '' },
    { label: 'Block A', value: 'Block A' },
    { label: 'Block B', value: 'Block B' },
    { label: 'Block C', value: 'Block C' },
    { label: 'Library', value: 'Library' },
    { label: 'Science Building', value: 'Science Building' },
    { label: 'Cafeteria', value: 'Cafeteria' },
  ];

  const priorityOptions = [
    { label: 'Low Priority', value: 'Low' },
    { label: 'Medium Priority', value: 'Medium' },
    { label: 'High Priority', value: 'High' },
    { label: 'Critical Safety Issue', value: 'Critical' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const issueTitle = title.trim() || `${category || 'Facility'} issue at ${building || 'Campus'} ${room}`.trim();
    if (issueTitle.length < 5) {
      setError('Please provide an issue title of at least 5 characters.');
      return;
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 20) {
      setError('Description must be at least 20 characters explaining the issue details.');
      return;
    }

    const locationStr = `${building} - ${room}`.trim().replace(/^-\s*|\s*-$/g, '') || 'Main Campus';

    setSubmitting(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: issueTitle,
          description: trimmedDesc,
          category: category || 'General',
          location: locationStr,
          priority,
          attachments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit issue');
      }

      router.push('/issues');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell initialRole="student">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Report Issue</h1>
          <p className="text-sm text-slate-500 font-medium">Tell us what's wrong and we'll take care of it.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <Input
            label="Issue Title"
            placeholder="e.g. AC not cooling in classroom"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Issue Category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <Select
              label="Priority Level"
              options={priorityOptions}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Building / Block"
              options={buildingOptions}
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              required
            />
            <Input
              label="Room / Location"
              placeholder="e.g. Room 204"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the issue in detail (at least 20 characters)..."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Upload Photo (optional)
            </label>
            <UploadDropzone attachments={attachments} setAttachments={setAttachments} />
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? 'Submitting Issue...' : 'Submit Issue'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

