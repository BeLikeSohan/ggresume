'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProfileIcon } from '@/components/preview/Icons';
import { Search, X } from 'lucide-react';

export interface IconOption {
  id: string;
  name: string;
  category: string;
}

export const AVAILABLE_PROFILE_ICONS: IconOption[] = [
  { id: 'github', name: 'GitHub', category: 'Development' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Professional' },
  { id: 'globe', name: 'Website / Portfolio', category: 'Web' },
  { id: 'twitter', name: 'Twitter / X', category: 'Social' },
  { id: 'leetcode', name: 'LeetCode', category: 'Development' },
  { id: 'kaggle', name: 'Kaggle', category: 'Data & AI' },
  { id: 'terminal', name: 'Terminal / HackerRank', category: 'Development' },
  { id: 'code', name: 'Code / Codeforces', category: 'Development' },
  { id: 'medium', name: 'Medium', category: 'Writing & Blog' },
  { id: 'substack', name: 'Substack', category: 'Writing & Blog' },
  { id: 'devto', name: 'Dev.to', category: 'Writing & Blog' },
  { id: 'book', name: 'Blog / Publications', category: 'Writing & Blog' },
  { id: 'figma', name: 'Figma', category: 'Design' },
  { id: 'dribbble', name: 'Dribbble', category: 'Design' },
  { id: 'behance', name: 'Behance', category: 'Design' },
  { id: 'palette', name: 'Design / Art', category: 'Design' },
  { id: 'youtube', name: 'YouTube', category: 'Media' },
  { id: 'discord', name: 'Discord', category: 'Community' },
  { id: 'telegram', name: 'Telegram', category: 'Community' },
  { id: 'stackoverflow', name: 'Stack Overflow', category: 'Community' },
  { id: 'scholar', name: 'Google Scholar', category: 'Academic' },
  { id: 'link', name: 'Generic / Custom Link', category: 'General' },
];

interface IconPickerProps {
  currentIcon?: string;
  onSelectIcon: (iconId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const IconPickerModal: React.FC<IconPickerProps> = ({
  currentIcon = 'link',
  onSelectIcon,
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIcons = AVAILABLE_PROFILE_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(search.toLowerCase()) ||
      icon.id.toLowerCase().includes(search.toLowerCase()) ||
      icon.category.toLowerCase().includes(search.toLowerCase())
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
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Choose an Icon</h3>
            <p className="text-[11px] text-slate-500">
              Select an icon for your profile link
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons (e.g. GitHub, Code, Figma)..."
              autoFocus
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition"
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="p-3 overflow-y-auto max-h-[340px] grid grid-cols-3 gap-2 scrollbar-thin">
          {filteredIcons.length > 0 ? (
            filteredIcons.map((icon) => {
              const isSelected = currentIcon.toLowerCase() === icon.id.toLowerCase();
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => {
                    onSelectIcon(icon.id);
                    onClose();
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer group ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition ${
                      isSelected
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    <ProfileIcon icon={icon.id} size={15} />
                  </div>
                  <span className="text-[11px] font-medium leading-tight truncate max-w-full">
                    {icon.name}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="col-span-3 py-8 text-center text-xs text-slate-400">
              No matching icons found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
