'use client';

import React from 'react';
import { FileText, PlusCircle } from 'lucide-react';

interface StartChoiceModalProps {
  isOpen: boolean;
  onSelectSample: () => void;
  onSelectScratch: () => void;
}

export const StartChoiceModal: React.FC<StartChoiceModalProps> = ({
  isOpen,
  onSelectSample,
  onSelectScratch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden z-10 p-6 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-modal-title"
      >
        <div>
          <h2
            id="start-modal-title"
            className="text-lg font-bold text-slate-900"
          >
            Start your resume
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose how you&apos;d like to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Sample */}
          <button
            type="button"
            onClick={onSelectSample}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition text-left flex flex-col justify-between gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <FileText size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Load Sample
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-filled example data
              </p>
            </div>
          </button>

          {/* Blank */}
          <button
            type="button"
            onClick={onSelectScratch}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition text-left flex flex-col justify-between gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <PlusCircle size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Start Blank
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Empty clean canvas
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
