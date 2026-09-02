'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, template: 'sample' | 'blank') => void;
}

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [template, setTemplate] = useState<'sample' | 'blank'>('sample');
  const [title, setTitle] = useState('Software Engineer Resume');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle =
      title.trim() ||
      (template === 'blank' ? 'Untitled Resume' : 'Software Engineer Resume');
    onCreate(finalTitle, template);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden z-10">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">New Resume</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Resume Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer, Frontend Specialist"
              autoFocus
              className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition shadow-2xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Starting Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTemplate('sample');
                  if (title === 'Untitled Resume')
                    setTitle('Software Engineer Resume');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                  template === 'sample'
                    ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-slate-900">
                    Sample
                  </span>
                  {template === 'sample' && (
                    <Check size={16} className="text-slate-900" />
                  )}
                </div>
                <span className="text-xs text-slate-500 leading-snug">
                  Standard layout with example ATS content
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplate('blank');
                  if (title === 'Software Engineer Resume')
                    setTitle('Untitled Resume');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                  template === 'blank'
                    ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-slate-900">
                    Blank
                  </span>
                  {template === 'blank' && (
                    <Check size={16} className="text-slate-900" />
                  )}
                </div>
                <span className="text-xs text-slate-500 leading-snug">
                  Start from an empty document
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="font-semibold shadow-xs"
            >
              Create Resume
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
