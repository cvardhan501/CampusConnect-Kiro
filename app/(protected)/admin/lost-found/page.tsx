'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { PackageSearch, Plus, MapPin } from 'lucide-react';

export default function AdminLostFoundPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('Item Photos');

  useEffect(() => {
    async function loadLostFound() {
      try {
        const res = await fetch('/api/lost-found', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (err) {
        console.error('Failed to load lost & found:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLostFound();
  }, []);

  const openLightbox = (images: any[], index: number, titleStr: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(titleStr);
    setLightboxOpen(true);
  };

  const openItemDetails = (item: any) => {
    setSelectedItem(null);
    setTimeout(() => {
      setSelectedItem(item);
      setDetailModalOpen(true);
    }, 0);
  };

  const tabs = [
    { id: 'All', label: 'All', count: items.length },
    { id: 'Lost', label: 'Lost', count: items.filter((i) => i.type === 'Lost').length },
    { id: 'Found', label: 'Found', count: items.filter((i) => i.type === 'Found').length },
  ];

  const filtered = items.filter((item) => {
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
    <AppShell initialRole="admin">
      <div className="space-y-6 select-none">
        {/* Header (Matching Screen #11) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Lost & Found</h1>
            <p className="text-sm text-slate-500 font-medium">Manage lost and found items across campus.</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />}>+ Add Item</Button>
        </div>

        {/* Content Container (Matching Screen #11) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

          <SearchInput
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <div className="text-center text-xs text-slate-400 py-8 font-semibold">Loading items...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No items cataloged"
              description="Reported lost and found items will appear in this repository."
              icon={<PackageSearch className="w-8 h-8 text-[#2563eb]" />}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const itemPhotos = item.attachments && item.attachments.length > 0
                  ? item.attachments
                  : item.imageUrl ? [{ url: item.imageUrl }] : [];

                return (
                  <div
                    key={item._id || item.id}
                    className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
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
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Photo Thumbnail Display */}
                      {itemPhotos.length > 0 && (
                        <div
                          onClick={() => openLightbox(itemPhotos, 0, item.title)}
                          className="relative h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group"
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

                      <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[100px]">{item.location}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openItemDetails(item)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Item Detail Modal */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Lost & Found Item Details"
          subtitle={selectedItem ? `${selectedItem.type} Item - ${selectedItem.title}` : ''}
        >
          {selectedItem && (
            <div className="space-y-4 text-xs select-none">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedItem.type === 'Found'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {selectedItem.type} Item
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Reported: {new Date(selectedItem.createdAt || selectedItem.date || Date.now()).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900">{selectedItem.title}</h4>
                <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {selectedItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-medium block">Category:</span>
                  <span className="font-bold text-slate-900">{selectedItem.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Location:</span>
                  <span className="font-bold text-slate-900">{selectedItem.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Contact Info:</span>
                  <span className="font-bold text-slate-900">{selectedItem.contactInfo}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Reporter:</span>
                  <span className="font-bold text-slate-900">
                    {selectedItem.reporter?.displayName || 'Campus User'}
                  </span>
                </div>
              </div>

              {((selectedItem.attachments && selectedItem.attachments.length > 0) || selectedItem.imageUrl) && (
                <div className="space-y-2 pt-1">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Attached Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedItem.attachments && selectedItem.attachments.length > 0
                      ? selectedItem.attachments
                      : [{ url: selectedItem.imageUrl }]
                    ).map((att: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() =>
                          openLightbox(
                            selectedItem.attachments || [{ url: selectedItem.imageUrl }],
                            idx,
                            selectedItem.title
                          )
                        }
                        className="relative h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:border-[#2563eb] transition-all"
                      >
                        <img
                          src={att.thumbnailUrl || att.url}
                          alt={selectedItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          attachments={lightboxImages}
          initialIndex={lightboxIndex}
          title={lightboxTitle}
        />
      </div>
    </AppShell>
  );
}
