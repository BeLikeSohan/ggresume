'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Upload,
  FileDown,
  Eye,
  Edit3,
  Loader2,
  Trash2,
  ArrowLeft,
  Copy,
  Check,
  Edit2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GGLogo } from '@/components/common/GGLogo';

export interface HeaderProps {
  resumeTitle?: string;
  onUpdateTitle?: (newTitle: string) => void;
  onDuplicate?: () => void;
  onDownloadPdf: () => void;
  onClear: () => void;
  onExportJson: () => void;
  onImportJson: (jsonData: string) => void;
  isDownloading: boolean;
  mobileView: 'editor' | 'preview';
  setMobileView: (view: 'editor' | 'preview') => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  resumeTitle = 'Software Engineer Resume',
  onUpdateTitle,
  onDuplicate,
  onDownloadPdf,
  onClear,
  onExportJson,
  onImportJson,
  isDownloading,
  mobileView,
  setMobileView,
  hasUnsavedChanges = false,
  isSaving = false,
  onSave,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resumeTitle);

  useEffect(() => {
    setTitleInput(resumeTitle);
  }, [resumeTitle]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== resumeTitle && onUpdateTitle) {
      onUpdateTitle(trimmed);
    } else {
      setTitleInput(resumeTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleInput(resumeTitle);
      setIsEditingTitle(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportJson(text);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBackNavigation = (e: React.MouseEvent) => {
    if (onBack) {
      e.preventDefault();
      onBack();
    }
  };

  return (
    <header className="app-header no-print h-16 bg-white border-b border-slate-200 px-3 md:px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs flex-shrink-0">
      {/* Left: Brand Logo, Back to Dashboard, and Resume Title */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={handleBackNavigation}
          className="flex items-center select-none group mr-0.5 cursor-pointer bg-transparent border-0 p-0"
          title="Back to GGResume Dashboard"
        >
          <GGLogo size="sm" variant="big" showWordmark={false} />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        <button
          type="button"
          onClick={handleBackNavigation}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer bg-transparent border-0"
          title="All Resumes"
        >
          <ArrowLeft size={13} />
          <span className="hidden md:inline">All Resumes</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Title / Renaming */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="px-2 py-0.5 text-xs md:text-sm font-bold text-slate-900 border border-slate-400 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white max-w-[160px] md:max-w-[240px]"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs md:text-sm font-bold text-slate-900 hover:bg-slate-100 transition text-left group max-w-[150px] sm:max-w-[220px] md:max-w-[280px] truncate"
              title="Click to rename this resume"
            >
              <span className="truncate">{resumeTitle}</span>
              <Edit2
                size={12}
                className="text-slate-400 opacity-60 group-hover:opacity-100 flex-shrink-0 transition"
              />
            </button>
          )}

          {/* Unsaved / Saved indicator dot */}
          {hasUnsavedChanges ? (
            <span
              className="hidden lg:inline-flex items-center gap-1.5 text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
              title="You have unsaved changes in memory"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved
            </span>
          ) : (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Check size={12} className="text-emerald-500" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Center: Mobile Editor/Preview Toggle */}
      <div className="flex lg:hidden rounded-lg bg-slate-100 p-1 border border-slate-200 mx-1">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
            mobileView === 'editor'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <Edit3 size={13} />
          <span>Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
            mobileView === 'preview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <Eye size={13} />
          <span>Preview</span>
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Hidden File Input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="hidden md:flex items-center gap-1 mr-1">
          {onDuplicate && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Copy size={14} />}
              onClick={onDuplicate}
              title="Duplicate this resume"
            >
              Duplicate
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 size={14} />}
            onClick={onClear}
            title="Clear all fields"
          >
            Clear
          </Button>

          <Button
            size="sm"
            variant="ghost"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
            title="Import Resume Data (JSON)"
          >
            Import
          </Button>

          <Button
            size="sm"
            variant="ghost"
            icon={<FileDown size={14} />}
            onClick={onExportJson}
            title="Export Resume Data (JSON)"
          >
            Export
          </Button>
        </div>

        {/* Save Button */}
        {onSave && (
          <Button
            size="sm"
            variant={hasUnsavedChanges ? 'primary' : 'outline'}
            icon={
              isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : hasUnsavedChanges ? (
                <Save size={14} />
              ) : (
                <Check size={14} className="text-emerald-500" />
              )
            }
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`font-semibold transition ${
              hasUnsavedChanges
                ? 'shadow-xs'
                : 'text-slate-500 border-slate-200 opacity-80'
            }`}
            title={hasUnsavedChanges ? 'Save changes' : 'All changes saved'}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
          </Button>
        )}

        {/* Primary Download Button */}
        <Button
          size="sm"
          variant="outline"
          icon={
            isDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )
          }
          onClick={onDownloadPdf}
          disabled={isDownloading}
          className="font-semibold bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
        >
          {isDownloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
    </header>
  );
};
