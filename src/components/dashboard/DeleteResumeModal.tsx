'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteResumeModalProps {
  isOpen: boolean;
  resumeTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteResumeModal: React.FC<DeleteResumeModalProps> = ({
  isOpen,
  resumeTitle,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden z-10">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle size={14} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Resume</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-slate-900">
              &quot;{resumeTitle}&quot;
            </span>
            ? This action cannot be undone.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onConfirm}
              className="font-semibold shadow-xs"
            >
              Delete Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
