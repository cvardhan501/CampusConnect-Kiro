'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { IAttachment } from '@/server/models/Issue';

interface ImageUploaderProps {
  value: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  disabled = false,
  label = 'Attach Photos',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    setError(null);
    const filesToUpload: File[] = [];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setError(`File "${file.name}" is not a supported format. Please upload JPG, PNG, or WEBP.`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`);
        return;
      }

      filesToUpload.push(file);
    }

    if (value.length + filesToUpload.length > maxFiles) {
      setError(`You can attach a maximum of ${maxFiles} photos.`);
      return;
    }

    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append('file', f));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image(s)');
      }

      if (data.files && Array.isArray(data.files)) {
        onChange([...value, ...data.files]);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#2563eb] bg-blue-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
          ) : (
            <div className="p-3 bg-white shadow-xs rounded-full border border-slate-200 text-slate-500">
              <Upload className="w-5 h-5 text-[#2563eb]" />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-800">
              {isUploading ? 'Uploading photos...' : 'Click or drag photos here to upload'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              JPG, PNG, WEBP up to {maxSizeMB}MB each (max {maxFiles} files)
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Thumbnail Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {value.map((attachment, idx) => (
            <div
              key={attachment.publicId || idx}
              className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-2xs"
            >
              <img
                src={attachment.thumbnailUrl || attachment.url}
                alt={attachment.fileName || `Attachment ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full transition-colors shadow-xs"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[10px] truncate px-1.5 py-0.5">
                {attachment.fileName || 'Image'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
