'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  className?: string;
}

export const DownloadToast: React.FC<DownloadToastProps> = ({
  message,
  type = 'success',
  className,
}) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none',
        className
      )}
    >
      {type === 'error' ? (
        <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
      ) : (
        <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
