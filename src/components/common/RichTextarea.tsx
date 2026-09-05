'use client';

import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Code,
  List,
  RemoveFormatting,
} from 'lucide-react';

export interface RichTextareaProps {
  label?: string;
  helperText?: string;
  placeholder?: string;
  value: string;
  rows?: number;
  className?: string;
  onChange: (value: string) => void;
}

export const RichTextarea: React.FC<RichTextareaProps> = ({
  label,
  helperText,
  placeholder,
  value,
  rows = 5,
  className = '',
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (
    prefix: string,
    suffix: string,
    defaultPlaceholder: string
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentVal = value || '';

    if (start === end) {
      const insertion = `${prefix}${defaultPlaceholder}${suffix}`;
      const updated =
        currentVal.substring(0, start) + insertion + currentVal.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + defaultPlaceholder.length
        );
      }, 0);
    } else {
      const selected = currentVal.substring(start, end);

      // If already wrapped with this formatting, toggle it off
      if (
        selected.startsWith(prefix) &&
        selected.endsWith(suffix) &&
        selected.length >= prefix.length + suffix.length
      ) {
        const unwrapped = selected.slice(
          prefix.length,
          selected.length - suffix.length
        );
        const updated =
          currentVal.substring(0, start) + unwrapped + currentVal.substring(end);
        onChange(updated);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + unwrapped.length);
        }, 0);
        return;
      }

      // Wrap selection
      const updated =
        currentVal.substring(0, start) +
        `${prefix}${selected}${suffix}` +
        currentVal.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, end + prefix.length + suffix.length);
      }, 0);
    }
  };

  const toggleBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentVal = value || '';

    // Find the start of the first selected line and end of the last selected line
    const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = currentVal.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = currentVal.length;

    const selectedBlock = currentVal.substring(lineStart, lineEnd);
    const lines = selectedBlock.split('\n');

    const allHaveBullets = lines.every(
      (l) => l.startsWith('• ') || l.startsWith('- ') || l.startsWith('* ')
    );

    const newLines = lines.map((l) => {
      if (allHaveBullets) {
        return l.replace(/^[\s•\-\*]+\s*/, '');
      } else {
        const cleaned = l.replace(/^[\s•\-\*]+\s*/, '');
        return `• ${cleaned}`;
      }
    });

    const replaced = newLines.join('\n');
    const updated =
      currentVal.substring(0, lineStart) + replaced + currentVal.substring(lineEnd);

    onChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + replaced.length);
    }, 0);
  };

  const removeAllFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentVal = value || '';

    if (start === end) {
      const cleaned = currentVal.replace(/(\*\*|__|\*|_|`)/g, '');
      onChange(cleaned);
    } else {
      const selected = currentVal.substring(start, end);
      const cleaned = selected.replace(/(\*\*|__|\*|_|`)/g, '');
      const updated =
        currentVal.substring(0, start) + cleaned + currentVal.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + cleaned.length);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac =
      typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyFormatting('**', '**', 'bold text');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyFormatting('*', '*', 'italic text');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        applyFormatting('__', '__', 'underlined text');
      } else if (e.key === '`') {
        e.preventDefault();
        applyFormatting('`', '`', 'code');
      }
    }
  };

  const wordCount = (value || '').trim().split(/\s+/).filter(Boolean).length;
  const lineCount = (value || '')
    .split('\n')
    .filter((l) => l.trim().length > 0).length;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] text-slate-400">
            {lineCount} {lineCount === 1 ? 'bullet' : 'bullets'} · {wordCount} words
          </span>
        </div>
      )}
      {helperText && (
        <p className="text-[11px] text-slate-500 leading-normal">
          {helperText}
        </p>
      )}

      {/* Rich Editor Box */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-1.5 bg-slate-50/90 border-b border-slate-200">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => applyFormatting('**', '**', 'bold text')}
              title="Bold (Ctrl+B) - **keyword**"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Bold size={13} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => applyFormatting('*', '*', 'italic text')}
              title="Italic (Ctrl+I) - *text*"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Italic size={13} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => applyFormatting('__', '__', 'underlined text')}
              title="Underline (Ctrl+U) - __text__"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Underline size={13} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => applyFormatting('`', '`', 'code')}
              title="Inline Code / Tech Tag - `tech`"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Code size={13} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={toggleBulletList}
              title="Toggle Bullet Point List (• item)"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <List size={13} className="stroke-[2.5]" />
            </button>

            <div className="h-3.5 w-px bg-slate-300 mx-0.5" />

            <button
              type="button"
              onClick={removeAllFormatting}
              title="Remove formatting from selection"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <RemoveFormatting size={13} />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none resize-y leading-relaxed font-sans"
          />
        </div>
      </div>
    </div>
  );
};
