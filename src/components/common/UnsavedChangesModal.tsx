'use client';

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSaveAndExit: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  isSaving = false,
  onClose,
  onDiscard,
  onSaveAndExit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-modal-title"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3
              id="unsaved-modal-title"
              className="text-base font-bold text-slate-900"
            >
              Unsaved changes
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You have unsaved modifications in your resume. What would you like to do before leaving?
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Stay on page
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
          >
            Discard & Exit
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSaveAndExit}
            disabled={isSaving}
            icon={isSaving ? <Loader2 size={14} className="animate-spin" /> : undefined}
          >
            {isSaving ? 'Saving...' : 'Save & Exit'}
          </Button>
        </div>
      </div>
    </div>
  );
};
