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
  const [category, setCategory] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const categoryOptions = [
    { label: 'Select category', value: '' },
    { label: 'AC / Ventilation', value: 'ac' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Wi-Fi / Network', value: 'network' },
    { label: 'Plumbing', value: 'plumbing' },
    { label: 'Electrical', value: 'electrical' },
    { label: 'General Maintenance', value: 'general' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/issues');
  };

  return (
    <AppShell initialRole="student">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Report Issue</h1>
          <p className="text-sm text-slate-500 font-medium">Tell us what's wrong and we'll take care of it.</p>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <Select
            label="Issue Category"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />

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
            placeholder="Describe the issue..."
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
            <Button type="submit" fullWidth size="lg">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
