'use client';

import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle2 } from 'lucide-react';

export interface UploadDropzoneProps {
  context?: 'IssueAttachment' | 'LostFoundAttachment' | 'ResolutionPhoto';
  maxFiles?: number;
  attachments?: any[];
  setAttachments?: React.Dispatch<React.SetStateAction<any[]>>;
  onAttachmentsChange?: (attachments: any[]) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  maxFiles = 5,
  attachments: externalAttachments,
  setAttachments: externalSetAttachments,
  onAttachmentsChange,
}) => {
  const [internalAttachments, setInternalAttachments] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const currentAttachments = externalAttachments !== undefined ? externalAttachments : internalAttachments;

  const updateAttachments = (newArr: any[]) => {
    if (externalSetAttachments) {
      externalSetAttachments(newArr);
    } else {
      setInternalAttachments(newArr);
    }
    if (onAttachmentsChange) {
      onAttachmentsChange(newArr);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const added: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      added.push({
        id: `file_${Date.now()}_${i}`,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: URL.createObjectURL(f),
      });
    }

    updateAttachments([...currentAttachments, ...added].slice(0, maxFiles));
  };

  const handleRemove = (id: string) => {
    updateAttachments(currentAttachments.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) {
            const files = e.dataTransfer.files;
            const added: any[] = [];
            for (let i = 0; i < files.length; i++) {
              const f = files[i];
              added.push({
                id: `file_${Date.now()}_${i}`,
                name: f.name,
                size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
                url: URL.createObjectURL(f),
              });
            }
            updateAttachments([...currentAttachments, ...added].slice(0, maxFiles));
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
          dragActive
            ? 'border-[#2563eb] bg-blue-50/50'
            : 'border-slate-200 hover:border-[#2563eb] bg-slate-50/50 hover:bg-blue-50/20'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto mb-2">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-xs font-bold text-[#2563eb]">Click to upload or drag and drop</p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">PNG, JPG (max 5MB)</p>
      </div>

      {currentAttachments.length > 0 && (
        <div className="space-y-2">
          {currentAttachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">{file.name}</span>
                {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
