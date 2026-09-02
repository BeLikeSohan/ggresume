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
  FileText,
} from 'lucide-react';
import { ResumeDocument } from '@/types/resume';
import { formatRelativeTime } from '@/lib/resumeStorage';

interface ResumeRowProps {
  resume: ResumeDocument;
  onDuplicate: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string, title: string) => void;
  onExportJson: (resume: ResumeDocument) => void;
}

export const ResumeRow: React.FC<ResumeRowProps> = ({
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

  return (
    <div className="group flex items-center justify-between px-5 sm:px-6 py-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 text-sm">
      {/* Title & icon */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-200 transition flex-shrink-0">
          <FileText size={18} />
        </div>
        <div className="min-w-0 pr-4">
          <Link
            href={`/editor/${id}`}
            className="font-bold text-slate-900 hover:text-slate-700 transition truncate block text-sm"
          >
            {title}
          </Link>
          <span className="text-xs text-slate-500 sm:hidden block truncate mt-0.5">
            {fullName} • {role}
          </span>
        </div>
      </div>

      {/* Candidate / Role column (medium+ screens) */}
      <div className="hidden sm:block w-56 truncate text-slate-600 text-xs font-medium">
        <span>{fullName}</span>
        <span className="text-slate-300 mx-1.5">•</span>
        <span className="text-slate-500">{role}</span>
      </div>

      {/* Updated column */}
      <div className="w-32 text-slate-500 text-xs font-medium text-right sm:text-left">
        {formatRelativeTime(updatedAt)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5 w-28 flex-shrink-0">
        <button
          type="button"
          onClick={() => onDuplicate(id)}
          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition hidden sm:inline-flex"
          title="Duplicate"
          aria-label="Duplicate"
        >
          <Copy size={15} />
        </button>

        <Link
          href={`/editor/${id}`}
          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition hidden sm:inline-flex"
          title="Edit"
          aria-label="Edit"
        >
          <ExternalLink size={15} />
        </Link>

        {/* Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
            aria-label="More actions"
          >
            <MoreHorizontal size={16} />
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
    </div>
  );
};
