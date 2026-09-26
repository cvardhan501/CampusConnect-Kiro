'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import { IAttachment } from '@/server/models/Issue';

export default function ReportLostFoundPage() {
  const router = useRouter();

  const [type, setType] = useState<'Lost' | 'Found'>('Lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5 || title.trim().length > 100) {
      setError('Item name must be between 5 and 100 characters');
      return;
    }

    if (description.trim().length < 10 || description.trim().length > 1000) {
      setError('Description must be between 10 and 1000 characters');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          itemDate,
          attachments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post item');
      }

      router.push(`/lost-found/${data.item._id}`);
    } catch (err: any) {
      setError(err.message || 'Error posting item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lost & Found</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Post a lost belonging or report a found item.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        {/* Type selector tabs */}
        <div className="flex border-b border-slate-100 font-bold text-sm">
          <button
            type="button"
            onClick={() => setType('Lost')}
            className={`pb-3 px-6 transition-all ${type === 'Lost' ? 'text-[#2563eb] border-b-2 border-[#2563eb]' : 'text-slate-400'}`}
          >
            Report Lost
          </button>
          <button
            type="button"
            onClick={() => setType('Found')}
            className={`pb-3 px-6 transition-all ${type === 'Found' ? 'text-[#2563eb] border-b-2 border-[#2563eb]' : 'text-slate-400'}`}
          >
            Report Found
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Laptop bag"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2563eb]"
              >
                <option value="Electronics">Electronics & Laptops</option>
                <option value="ID_Cards">ID Cards & Wallets</option>
                <option value="Keys">Keys & Accessories</option>
                <option value="Books">Books & Stationary</option>
                <option value="Clothing">Clothing & Apparel</option>
                <option value="Other">Others</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe the item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Seen Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Block C"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date & Time
              </label>
              <input
                type="date"
                required
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Upload Photo (optional)
            </label>
            <UploadDropzone
              context="LostFoundAttachment"
              maxFiles={3}
              onAttachmentsChange={(atts) => setAttachments(atts)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#2563eb] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#1d4ed8]"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
