'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IAttachment } from '@/server/models/Issue';
import { Snowflake, Armchair, Wifi, Droplet, Zap, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReportIssuePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'Facilities', label: 'Facilities', icon: Snowflake, desc: 'AC, heating, ventilation, structural' },
    { id: 'IT Support', label: 'Wi-Fi / IT Support', icon: Wifi, desc: 'Internet, network, hardware' },
    { id: 'Furniture', label: 'Furniture', icon: Armchair, desc: 'Chairs, desks, whiteboards' },
    { id: 'Plumbing', label: 'Plumbing', icon: Droplet, desc: 'Leaks, restrooms, water supply' },
    { id: 'Electrical', label: 'Electrical', icon: Zap, desc: 'Lights, power outlets, breakers' },
    { id: 'General', label: 'General Maintenance', icon: Wrench, desc: 'Cleanliness, doors, locks, misc' },
  ];

  const buildingOptions = [
    { label: 'Select Building', value: '' },
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

    const issueTitle = title.trim() || `${category} issue at ${building} ${room}`.trim();
    if (issueTitle.length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (description.trim().length < 20) {
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
          description: description.trim(),
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
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell initialRole="student">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Report Issue</h1>
          <p className="text-sm text-slate-500 font-medium">Tell us what's wrong and we'll take care of it.</p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  s === step
                    ? 'bg-[#2563eb] text-white ring-4 ring-blue-100'
                    : s < step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {s === 1 ? 'Category' : s === 2 ? 'Location' : s === 3 ? 'Details & Photos' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
          {/* STEP 1: Category */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Step 1: Select Issue Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-[#2563eb] bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{c.label}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  disabled={!category}
                  onClick={() => setStep(2)}
                >
                  Continue to Location →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Step 2: Specify Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Building / Block"
                  options={buildingOptions}
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  required
                />
                <Input
                  label="Room / Specific Area"
                  placeholder="e.g. Room 204 or 2nd Floor Hallway"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button
                  type="button"
                  disabled={!building || !room}
                  onClick={() => setStep(3)}
                >
                  Continue to Details →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Details & Image Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Step 3: Issue Details & Photos</h3>
              <Input
                label="Issue Title"
                placeholder="e.g. AC not cooling in classroom"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Select
                label="Priority Level"
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              />
              <Textarea
                label="Detailed Description"
                placeholder="Explain the problem in detail (minimum 20 characters)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />

              <ImageUploader
                label="Attach Photos of the Issue (Optional)"
                value={attachments}
                onChange={setAttachments}
                maxFiles={5}
              />

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button
                  type="button"
                  disabled={!title || description.length < 20}
                  onClick={() => setStep(4)}
                >
                  Review Request →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-base font-extrabold text-slate-900">Step 4: Review & Submit</h3>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Category:</span>
                    <p className="font-bold text-slate-900">{category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Priority:</span>
                    <p className="font-bold text-slate-900">{priority}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Location:</span>
                    <p className="font-bold text-slate-900">{building} - {room}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Title:</span>
                    <p className="font-bold text-slate-900">{title}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-xs text-slate-400 font-medium">Description:</span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{description}</p>
                </div>

                {attachments.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-xs text-slate-400 font-medium">Attached Photos ({attachments.length}):</span>
                    <div className="flex space-x-2 mt-2">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                          <img src={att.thumbnailUrl || att.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  ← Back
                </Button>
                <Button type="submit" loading={submitting} icon={<CheckCircle2 className="w-4 h-4" />}>
                  Submit Report
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </AppShell>
  );
}
