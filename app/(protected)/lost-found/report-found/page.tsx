'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { UploadDropzone } from '@/components/ui/UploadDropzone';

export default function ReportFoundItemPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Report Found');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const formTabs = [
    { id: 'Report Lost', label: 'Report Lost' },
    { id: 'Report Found', label: 'Report Found' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'Report Lost') {
      router.push('/lost-found/report-lost');
    }
  };

  const categoryOptions = [
    { label: 'Select category', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Bags & Accessories', value: 'bags' },
    { label: 'Cards & Documents', value: 'documents' },
    { label: 'Personal Belongings', value: 'personal' },
    { label: 'Books & Stationery', value: 'books' },
    { label: 'Others', value: 'others' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/lost-found');
  };

  return (
    <AppShell initialRole="student">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Lost & Found</h1>
          <p className="text-sm text-slate-500 font-medium">Report an item you found on campus to help return it to its owner.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <Tabs tabs={formTabs} activeTab={activeTab} onChange={handleTabChange} variant="underlined" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Name"
              placeholder="e.g. Student ID Card"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
            <Select
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the item found..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Found Location"
              placeholder="e.g. Cafeteria Table #4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Input
              label="Date & Time Found"
              type="text"
              placeholder="Select date & time"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Upload Photo (optional)
            </label>
            <UploadDropzone attachments={attachments} setAttachments={setAttachments} />
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg">
              Submit Found Report
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
