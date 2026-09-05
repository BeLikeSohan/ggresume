'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  Printer,
  ChevronDown,
  CloudDownload,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GGLogo } from '@/components/common/GGLogo';

export interface HeaderProps {
  resumeTitle?: string;
  onUpdateTitle?: (newTitle: string) => void;
  onDuplicate?: () => void;
  onSavePdfClient?: () => void;
  onDownloadPdfServer?: () => void;
  onDownloadPdf?: () => void;
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
  onSavePdfClient,
  onDownloadPdfServer,
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
  const pdfMenuRef = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resumeTitle);
  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState(false);

  useEffect(() => {
    setTitleInput(resumeTitle);
  }, [resumeTitle]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pdfMenuRef.current && !pdfMenuRef.current.contains(e.target as Node)) {
        setIsPdfMenuOpen(false);
      }
    };
    if (isPdfMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPdfMenuOpen]);

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

  const isServerPdfEnabled =
    process.env.NEXT_PUBLIC_ENABLE_SERVER_PDF === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_SERVER_PDF === '1';

  const handleBackNavigation = (e: React.MouseEvent) => {
    if (onBack) {
      e.preventDefault();
      onBack();
    }
  };

  const handleClientPdfClick = () => {
    setIsPdfMenuOpen(false);
    if (onSavePdfClient) {
      onSavePdfClient();
    } else if (onDownloadPdf) {
      onDownloadPdf();
    }
  };

  const handleServerPdfClick = () => {
    setIsPdfMenuOpen(false);
    if (onDownloadPdfServer) {
      onDownloadPdfServer();
    } else if (onDownloadPdf) {
      onDownloadPdf();
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

        {/* PDF Export Button (Split with dropdown if server export enabled, standard button if disabled) */}
        {isServerPdfEnabled ? (
          <div className="relative inline-flex items-center" ref={pdfMenuRef}>
            <div className="inline-flex rounded-lg shadow-xs overflow-hidden border border-slate-300">
              {/* Main Action: Save as PDF (Client) */}
              <button
                type="button"
                onClick={handleClientPdfClick}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                title="Save as PDF via Browser Print (Instant & Vector Quality)"
              >
                {isDownloading ? (
                  <Loader2 size={13} className="animate-spin text-slate-600" />
                ) : (
                  <Printer size={13} className="text-slate-700" />
                )}
                <span>{isDownloading ? 'Exporting...' : 'Save PDF'}</span>
              </button>

              {/* Dropdown Toggle */}
              <button
                type="button"
                onClick={() => setIsPdfMenuOpen((prev) => !prev)}
                disabled={isDownloading}
                className="px-1.5 py-1.5 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l border-slate-200 disabled:opacity-50 transition cursor-pointer"
                title="PDF Export options"
                aria-label="PDF Export options"
                aria-expanded={isPdfMenuOpen}
              >
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-150 ${
                    isPdfMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isPdfMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                <button
                  type="button"
                  onClick={handleClientPdfClick}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100 transition">
                    <Sparkles size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900">
                        Save as PDF (Browser)
                      </span>
                      <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                        Fast
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Instant vector PDF via browser print dialog. Recommended.
                    </p>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleServerPdfClick}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-slate-200 transition">
                    <CloudDownload size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900">
                        Download PDF (Server)
                      </span>
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                        Fallback
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Generates PDF on cloud server via headless Chrome.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleClientPdfClick}
            disabled={isDownloading}
            className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-xs"
            title="Save as PDF via Browser Print Dialog (Instant & Vector Quality)"
          >
            {isDownloading ? (
              <Loader2 size={13} className="animate-spin text-white" />
            ) : (
              <Printer size={13} className="text-white" />
            )}
            <span>{isDownloading ? 'Opening Print...' : 'Save PDF'}</span>
          </Button>
        )}
      </div>
    </header>
  );
};
