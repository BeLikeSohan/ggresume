'use client';

import React, { useRef, useState } from 'react';
import {
  FileText,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Code,
  List,
  RemoveFormatting,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SectionHeaderWithTitle } from './SectionTitleInput';
import { FormattedText } from '../preview/FormattedText';

export interface ProfileEditorProps {
  value: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  onChange: (value: string) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  value,
  title = 'Profile',
  onTitleChange,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(true);

  const applyFormatting = (
    prefix: string,
    suffix: string,
    defaultPlaceholder: string
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';

    if (start === end) {
      // Nothing selected, insert placeholder wrapped in formatting
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

  const insertBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';

    if (start === end) {
      const prefix = start === 0 || currentVal[start - 1] === '\n' ? '• ' : '\n• ';
      const updated =
        currentVal.substring(0, start) + prefix + currentVal.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length
        );
      }, 0);
    } else {
      const selected = currentVal.substring(start, end);
      const lines = selected.split('\n');
      const bulleted = lines.map((l) => (l.startsWith('• ') ? l : `• ${l}`)).join('\n');
      const updated =
        currentVal.substring(0, start) + bulleted + currentVal.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + bulleted.length);
      }, 0);
    }
  };

  const removeAllFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';

    if (start === end) {
      // Clean whole text
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
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
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

  return (
    <div className="space-y-4">
      {/* Section Header with default "Profile" populated */}
      <SectionHeaderWithTitle
        icon={FileText}
        defaultTitle="Profile"
        value={title || 'Profile'}
        onChange={onTitleChange}
        description="Concise summary of your background, core technical focus, and career achievements."
      />

      {/* Rich Editor Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
        {/* Rich Formatting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50/90 border-b border-slate-200">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => applyFormatting('**', '**', 'bold text')}
              title="Bold (Ctrl+B) - **keyword**"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Bold size={14} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => applyFormatting('*', '*', 'italic text')}
              title="Italic (Ctrl+I) - *text*"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Italic size={14} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => applyFormatting('__', '__', 'underlined text')}
              title="Underline (Ctrl+U) - __text__"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Underline size={14} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => applyFormatting('`', '`', 'code')}
              title="Inline Code / Tech Tag - `tech`"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <Code size={14} className="stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={insertBullet}
              title="Bullet Point (• item)"
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 active:bg-slate-300 transition cursor-pointer"
            >
              <List size={14} className="stroke-[2.5]" />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={removeAllFormatting}
              title="Remove formatting from selected text"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <RemoveFormatting size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {wordCount} words
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                showPreview
                  ? 'bg-slate-200 text-slate-800'
                  : 'text-slate-500 hover:bg-slate-200/60'
              }`}
            >
              {showPreview ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>{showPreview ? 'Preview On' : 'Preview Off'}</span>
            </button>
          </div>
        </div>

        {/* Textarea Input */}
        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Backend Software Engineer with 3+ years of experience in **Go**, **Java**, and **PostgreSQL**..."
            className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Live Formatted Output Preview */}
        {showPreview && value.trim() && (
          <div className="px-3.5 py-3 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Eye size={11} />
              <span>Formatted Output Preview</span>
            </div>
            <div className="prose-xs text-slate-800">
              <FormattedText text={value} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
