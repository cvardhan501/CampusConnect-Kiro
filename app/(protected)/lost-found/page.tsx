'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { IAttachment } from '@/server/models/Issue';
import { PackageSearch, Plus, MapPin, Phone, RefreshCw, AlertTriangle } from 'lucide-react';

export default function LostFoundPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [type, setType] = useState<'Lost' | 'Found'>('Lost');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('Item Photos');

  const loadItems = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lost-found', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch Lost & Found items. Please try again.');
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      console.error('Failed to load Lost & Found:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems(true);
  }, [loadItems]);

  const openLightbox = (images: any[], index: number, titleStr: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(titleStr);
    setLightboxOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          type,
          location,
          contactInfo,
          attachments,
        }),
      });

      if (res.ok) {
        setIsReportModalOpen(false);
        setTitle('');
        setDescription('');
        setContactInfo('');
        setLocation('');
        setAttachments([]);
        // Refresh list
        loadItems(false);
      }
    } catch (err) {
      console.error('Failed to report item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'All', label: 'All Items', count: items.length },
    { id: 'Lost', label: 'Lost Items', count: items.filter((i) => i.type === 'Lost').length },
    { id: 'Found', label: 'Found Items', count: items.filter((i) => i.type === 'Found').length },
  ];

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'All' || item.type === activeTab;
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(s) ||
      item.location?.toLowerCase().includes(s) ||
      item.category?.toLowerCase().includes(s);

    return matchesTab && matchesSearch;
  });

  return (
    <AppShell initialRole="student">
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Lost & Found</h1>
            <p className="text-sm text-slate-500 font-medium">Browse, search, or report lost and found items on campus.</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsReportModalOpen(true)}>
            Report Item
          </Button>
        </div>

        {/* Filters & Items Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

          <SearchInput
            placeholder="Search lost and found items by title, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <LoadingState message="Loading Lost & Found items..." />
          ) : error && items.length === 0 ? (
            <EmptyState
              title="Failed to load items"
              description={error}
              icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
              action={
                <Button variant="outline" onClick={() => loadItems(true)} icon={<RefreshCw className="w-4 h-4" />}>
                  Retry
                </Button>
              }
            />
          ) : filteredItems.length === 0 ? (
            searchQuery || activeTab !== 'All' ? (
              <EmptyState
                title="No matching items"
                description="No lost or found items match your current search or category filter."
                icon={<PackageSearch className="w-8 h-8 text-[#2563eb]" />}
                action={
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveTab('All'); }}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No items found"
                description="Report a lost or found item to list it on the campus bulletin."
                icon={<PackageSearch className="w-8 h-8 text-[#2563eb]" />}
                action={
                  <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsReportModalOpen(true)}>
                    Report Item
                  </Button>
                }
              />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const itemPhotos = item.attachments && item.attachments.length > 0
                  ? item.attachments
                  : item.imageUrl ? [{ url: item.imageUrl }] : [];

                return (
                  <div
                    key={item._id || item.id}
                    className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            item.type === 'Found'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                          role="status"
                          aria-label={`Item status: ${item.type}`}
                          title={`Item status: ${item.type}`}
                        >
                          {item.type} Item
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.createdAt || item.date).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Photo Thumbnail Display */}
                      {itemPhotos.length > 0 && (
                        <div
                          onClick={() => openLightbox(itemPhotos, 0, item.title)}
                          className="relative h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group"
                        >
                          <img
                            src={itemPhotos[0].thumbnailUrl || itemPhotos[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {itemPhotos.length > 1 && (
                            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                              +{itemPhotos.length - 1} photos
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 space-y-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-semibold text-slate-700">{item.contactInfo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Report Item Modal */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Report Lost / Found Item"
          subtitle="List an item on the campus bulletin."
        >
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Item Type"
                options={[
                  { label: 'Lost Item', value: 'Lost' },
                  { label: 'Found Item', value: 'Found' },
                ]}
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                required
              />
              <Select
                label="Category"
                options={[
                  { label: 'Electronics', value: 'Electronics' },
                  { label: 'Documents / Cards', value: 'Documents' },
                  { label: 'Accessories / Jewelry', value: 'Accessories' },
                  { label: 'Bags / Backpacks', value: 'Bags' },
                  { label: 'Clothing', value: 'Clothing' },
                  { label: 'Keys', value: 'Keys' },
                  { label: 'Other', value: 'Other' },
                ]}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <Input
              label="Item Title"
              placeholder="e.g. Blue Backpack with Laptop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Location"
              placeholder="e.g. Library 2nd Floor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <Input
              label="Contact Info"
              placeholder="e.g. Email or Phone number"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe the item details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />

            <ImageUploader
              label="Attach Item Photos (Optional)"
              value={attachments}
              onChange={setAttachments}
              maxFiles={4}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit Item Listing
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
