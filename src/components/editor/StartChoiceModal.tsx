'use client';

import React from 'react';
import { FileText, FilePlus, Sparkles, ArrowRight } from 'lucide-react';
import { GGLogo } from '@/components/common/GGLogo';

interface StartChoiceModalProps {
  isOpen: boolean;
  onSelectSample: () => void;
  onSelectScratch: () => void;
  onClose?: () => void;
}

export const StartChoiceModal: React.FC<StartChoiceModalProps> = ({
  isOpen,
  onSelectSample,
  onSelectScratch,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6 sm:p-7 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-modal-title"
      >
        {/* Header with Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <GGLogo size="md" showWordmark={false} />
          </div>
          <h2
            id="start-modal-title"
            className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight"
          >
            How would you like to start?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Choose whether to explore with pre-filled sample content or start fresh with a blank canvas.
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Option 1: Load Existing Sample */}
          <button
            type="button"
            onClick={onSelectSample}
            className="group relative p-4 rounded-xl border-2 border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50/80 transition-all duration-150 text-left flex flex-col justify-between h-44 shadow-2xs hover:shadow-md cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
                  Sample
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Load Sample
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Pre-filled with an ATS-friendly Software Engineer profile to easily explore layouts.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-semibold text-slate-700 group-hover:text-blue-600 pt-2 transition-colors">
              <span>Use Sample Data</span>
              <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option 2: Start From Scratch */}
          <button
            type="button"
            onClick={onSelectScratch}
            className="group relative p-4 rounded-xl border-2 border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50/80 transition-all duration-150 text-left flex flex-col justify-between h-44 shadow-2xs hover:shadow-md cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FilePlus size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                  Blank
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                  Start from Scratch
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  A completely clean slate with empty fields to fill in your personal details.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-semibold text-slate-700 group-hover:text-slate-950 pt-2 transition-colors">
              <span>Start Blank</span>
              <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-slate-400">
          You can clear fields or import JSON data anytime from the editor header.
        </p>
      </div>
    </div>
  );
};
