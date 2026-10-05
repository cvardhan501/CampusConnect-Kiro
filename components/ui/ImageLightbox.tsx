'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { IAttachment } from '@/server/models/Issue';

interface ImageLightboxProps {
  attachments: IAttachment[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  attachments,
  initialIndex = 0,
  isOpen,
  onClose,
  title = 'Attachment View',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
  }, [attachments]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
  }, [attachments]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !attachments || attachments.length === 0) return null;

  const current = attachments[currentIndex] || attachments[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-4xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {currentIndex + 1} of {attachments.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {current?.url && (
              <a
                href={current.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Open original image in new tab"
                aria-label="Open original image in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close image lightbox"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Display */}
        <div className="relative flex-1 flex items-center justify-center p-6 bg-slate-950 overflow-hidden min-h-[350px]">
          <img
            src={current.url}
            alt={current.fileName || `Attachment ${currentIndex + 1}`}
            className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
          />

          {attachments.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-lg transition-all"
                title="Previous image"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-lg transition-all"
                title="Next image"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Footer info & thumbnails */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-md font-mono">{current.fileName || 'Attachment'}</span>

          {attachments.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto py-1">
              {attachments.map((att, idx) => (
                <button
                  key={att.publicId || idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Select photo ${idx + 1} of ${attachments.length}`}
                  className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                    idx === currentIndex ? 'border-[#2563eb] scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={att.thumbnailUrl || att.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
