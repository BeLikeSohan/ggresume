'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Trash2,
  FileDown,
  MoreHorizontal,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { ResumeDocument } from '@/types/resume';
import { formatRelativeTime } from '@/lib/resumeStorage';

interface ResumeCardProps {
  resume: ResumeDocument;
  onDuplicate: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string, title: string) => void;
  onExportJson: (resume: ResumeDocument) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onDuplicate,
  onRename,
  onDelete,
  onExportJson,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { id, title, updatedAt, data } = resume;
  const fullName = data.personal?.fullName?.trim() || 'Untitled Candidate';
  const role =
    data.experiences?.[0]?.role ||
    data.profile?.slice(0, 36) ||
    'Software Engineer';
  const summarySnippet =
    data.profile?.trim() ||
    data.experiences?.[0]?.highlights?.[0] ||
    'Engineering leader with expertise building high-performance systems.';

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden shadow-2xs">
      {/* Document Sheet Preview */}
      <Link
        href={`/editor/${id}`}
        className="relative bg-slate-50/90 border-b border-slate-100 p-5 flex items-center justify-center cursor-pointer select-none overflow-hidden group-hover:bg-slate-100/60 transition-colors"
      >
        {/* Crisp miniature paper preview */}
        <div className="w-full max-w-[240px] h-[175px] bg-white rounded-md border border-slate-200 shadow-xs p-4 flex flex-col justify-between transition-transform duration-150 group-hover:scale-[1.02]">
          <div className="space-y-2 overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                {fullName}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">A4</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium truncate">
              {role}
            </p>
            <p className="text-[9.5px] text-slate-500 leading-relaxed line-clamp-3 font-serif">
              {summarySnippet}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>{data.experiences?.length || 0} experiences</span>
            <span>{data.skills?.length || 0} skills</span>
          </div>
        </div>

        {/* Hover open overlay */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/[0.03] transition-colors flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all transform translate-y-1 group-hover:translate-y-0">
            Open editor
          </span>
        </div>
      </Link>

      {/* Card Info & Meta */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/editor/${id}`}
              className="text-sm sm:text-base font-bold text-slate-900 hover:text-slate-700 transition truncate block leading-tight"
              title={title}
            >
              {title}
            </Link>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Edited {formatRelativeTime(updatedAt)}
            </p>
          </div>

          {/* Context menu */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
              title="More options"
            >
              <MoreHorizontal size={17} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(id, title);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Edit2 size={14} className="text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(id);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Copy size={14} className="text-slate-400" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onExportJson(resume);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <FileDown size={14} className="text-slate-400" />
                    <span>Export JSON</span>
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(id, title);
                    }}
                    className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    <Trash2 size={14} className="text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick action bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-xs text-slate-500 truncate max-w-[150px] font-medium">
            {fullName}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onDuplicate(id)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition"
              title="Duplicate"
              aria-label="Duplicate"
            >
              <Copy size={15} />
            </button>
            <Link
              href={`/editor/${id}`}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-800 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-md transition"
            >
              <span>Edit</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
