'use client';

import React, { useEffect } from 'react';
import { Sparkles, Printer, Download, X, Zap, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ServerPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseClientSave: () => void;
  onProceedServerDownload: () => void;
  isDownloading?: boolean;
}

export const ServerPdfModal: React.FC<ServerPdfModalProps> = ({
  isOpen,
  onClose,
  onUseClientSave,
  onProceedServerDownload,
  isDownloading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDownloading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isDownloading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="server-pdf-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3
                id="server-pdf-modal-title"
                className="text-base font-bold text-slate-900"
              >
                Recommended: Browser PDF Save
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Faster export with 100% vector typography
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <p>
            We highly recommend using <strong className="text-slate-900 font-semibold">Save as PDF (Browser)</strong> for instantaneous, pixel-perfect output directly on your device.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900 text-xs">
                <Zap size={14} className="text-blue-600" />
                <span>Browser Save (Fast)</span>
              </div>
              <p className="text-[11px] text-blue-950/80 leading-normal">
                Instant generation, crisp vector text, zero server wait time. Select &quot;Save as PDF&quot; in the print dialog.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                <Cloud size={14} className="text-slate-600" />
                <span>Server Download</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Headless browser rendering on our server. Takes several seconds. Only use if browser printing is not working.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDownloading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onProceedServerDownload}
            disabled={isDownloading}
            icon={<Download size={14} />}
            className="text-slate-700 hover:text-slate-900"
          >
            {isDownloading ? 'Generating...' : 'Download from Server'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onUseClientSave}
            disabled={isDownloading}
            icon={<Printer size={14} />}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-semibold"
          >
            Save with Browser
          </Button>
        </div>
      </div>
    </div>
  );
};
