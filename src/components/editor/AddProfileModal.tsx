'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProfileIcon } from '@/components/preview/Icons';
import { Search, X, Sparkles, Plus } from 'lucide-react';

export interface ProfileTypeOption {
  id: string;
  label: string;
  icon: string;
  placeholder: string;
  category: 'Coding & Tech' | 'Professional & Social' | 'Writing & Content' | 'Design & Other';
}

export const PROFILE_TYPE_OPTIONS: ProfileTypeOption[] = [
  // Coding & Tech
  {
    id: 'github',
    label: 'GitHub',
    icon: 'github',
    placeholder: 'github.com/username',
    category: 'Coding & Tech',
  },
  {
    id: 'leetcode',
    label: 'LeetCode',
    icon: 'leetcode',
    placeholder: 'leetcode.com/u/username',
    category: 'Coding & Tech',
  },
  {
    id: 'kaggle',
    label: 'Kaggle',
    icon: 'kaggle',
    placeholder: 'kaggle.com/username',
    category: 'Coding & Tech',
  },
  {
    id: 'terminal',
    label: 'Codeforces / HackerRank',
    icon: 'terminal',
    placeholder: 'codeforces.com/profile/username',
    category: 'Coding & Tech',
  },
  {
    id: 'stackoverflow',
    label: 'Stack Overflow',
    icon: 'stackoverflow',
    placeholder: 'stackoverflow.com/users/id/name',
    category: 'Coding & Tech',
  },

  // Professional & Social
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'linkedin',
    placeholder: 'linkedin.com/in/username',
    category: 'Professional & Social',
  },
  {
    id: 'globe',
    label: 'Portfolio / Website',
    icon: 'globe',
    placeholder: 'yourwebsite.com',
    category: 'Professional & Social',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: 'twitter',
    placeholder: 'x.com/username',
    category: 'Professional & Social',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: 'discord',
    placeholder: 'discord.gg/username',
    category: 'Professional & Social',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: 'telegram',
    placeholder: 't.me/username',
    category: 'Professional & Social',
  },

  // Writing & Content
  {
    id: 'medium',
    label: 'Medium',
    icon: 'medium',
    placeholder: 'medium.com/@username',
    category: 'Writing & Content',
  },
  {
    id: 'substack',
    label: 'Substack',
    icon: 'substack',
    placeholder: 'username.substack.com',
    category: 'Writing & Content',
  },
  {
    id: 'devto',
    label: 'Dev.to',
    icon: 'devto',
    placeholder: 'dev.to/username',
    category: 'Writing & Content',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: 'youtube',
    placeholder: 'youtube.com/@channel',
    category: 'Writing & Content',
  },
  {
    id: 'scholar',
    label: 'Google Scholar',
    icon: 'scholar',
    placeholder: 'scholar.google.com/citations?user=...',
    category: 'Writing & Content',
  },

  // Design & Other
  {
    id: 'figma',
    label: 'Figma',
    icon: 'figma',
    placeholder: 'figma.com/@username',
    category: 'Design & Other',
  },
  {
    id: 'dribbble',
    label: 'Dribbble',
    icon: 'dribbble',
    placeholder: 'dribbble.com/username',
    category: 'Design & Other',
  },
  {
    id: 'behance',
    label: 'Behance',
    icon: 'behance',
    placeholder: 'behance.net/username',
    category: 'Design & Other',
  },
  {
    id: 'custom',
    label: 'Custom Link',
    icon: 'link',
    placeholder: 'https://...',
    category: 'Design & Other',
  },
];

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (option: ProfileTypeOption) => void;
}

export const AddProfileModal: React.FC<AddProfileModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const [search, setSearch] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setSearch('');
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredOptions = PROFILE_TYPE_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.category.toLowerCase().includes(search.toLowerCase()) ||
      opt.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add Profile Link</h3>
            <p className="text-xs text-slate-500">
              Select the type of profile link you want to add
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search platforms (e.g. GitHub, LinkedIn, LeetCode, Custom)..."
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
            />
          </div>
        </div>

        {/* Options Grid */}
        <div className="p-3.5 overflow-y-auto max-h-[400px] space-y-3 scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelectType(opt);
                  onClose();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-left transition cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 group-hover:text-white transition">
                  <ProfileIcon icon={opt.icon} size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {opt.category}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredOptions.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-500 mb-2">No matching platform found</p>
              <button
                type="button"
                onClick={() => {
                  onSelectType({
                    id: 'custom',
                    label: search || 'Custom Link',
                    icon: 'link',
                    placeholder: 'https://...',
                    category: 'Design & Other',
                  });
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <Plus size={13} />
                <span>Add &quot;{search}&quot; as Custom Link</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
