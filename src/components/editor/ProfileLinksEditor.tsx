'use client';

import React, { useState } from 'react';
import { ProfileLink } from '@/types/resume';
import { ProfileIcon } from '@/components/preview/Icons';
import { AddProfileModal, ProfileTypeOption } from './AddProfileModal';
import { IconPickerModal } from './IconPickerModal';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ProfileLinksEditorProps {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
}

export const ProfileLinksEditor: React.FC<ProfileLinksEditorProps> = ({
  links = [],
  onChange,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePickerLinkId, setActivePickerLinkId] = useState<string | null>(null);

  const handleSelectType = (option: ProfileTypeOption) => {
    const newLink: ProfileLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: option.label,
      url: '',
      icon: option.icon,
    };
    onChange([...links, newLink]);
  };

  const handleUpdateLink = (id: string, updates: Partial<ProfileLink>) => {
    onChange(
      links.map((link) => (link.id === id ? { ...link, ...updates } : link))
    );
  };

  const handleDeleteLink = (id: string) => {
    onChange(links.filter((link) => link.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    const temp = newLinks[index - 1];
    newLinks[index - 1] = newLinks[index];
    newLinks[index] = temp;
    onChange(newLinks);
  };

  const handleMoveDown = (index: number) => {
    if (index >= links.length - 1) return;
    const newLinks = [...links];
    const temp = newLinks[index + 1];
    newLinks[index + 1] = newLinks[index];
    newLinks[index] = temp;
    onChange(newLinks);
  };

  const activeLinkForPicker = links.find((l) => l.id === activePickerLinkId);

  return (
    <div className="pt-3 border-t border-slate-200">
      {/* Sub-section Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <LinkIcon size={13} className="text-slate-500" />
            Profile Links
          </h4>
          <p className="text-[11px] text-slate-500">
            Add GitHub, LinkedIn, portfolio, or custom profile links.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          icon={<Plus size={13} />}
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs font-semibold"
        >
          Add Profile
        </Button>
      </div>

      {/* Profile Links List */}
      {links.length > 0 ? (
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div
              key={link.id}
              className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition flex flex-col gap-2"
            >
              {/* Row: Icon button + Label + Reorder/Delete */}
              <div className="flex items-center gap-2">
                {/* Icon Selector Button */}
                <button
                  type="button"
                  onClick={() => setActivePickerLinkId(link.id)}
                  title="Click to change icon"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 transition cursor-pointer group relative"
                >
                  <ProfileIcon icon={link.icon || 'link'} size={14} />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-slate-200">
                    <Edit2 size={8} className="text-slate-400" />
                  </div>
                </button>

                {/* Label Input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) =>
                      handleUpdateLink(link.id, { label: e.target.value })
                    }
                    placeholder="e.g. GitHub, LinkedIn, Portfolio"
                    className="w-full px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                {/* Controls: Move Up, Move Down, Delete */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
                    title="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === links.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
                    title="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer ml-1"
                    title="Remove link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* URL Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    handleUpdateLink(link.id, { url: e.target.value })
                  }
                  placeholder={`e.g. ${
                    link.icon === 'github'
                      ? 'github.com/username'
                      : link.icon === 'linkedin'
                      ? 'linkedin.com/in/username'
                      : 'https://...'
                  }`}
                  className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50 flex flex-col items-center justify-center">
          <p className="text-xs text-slate-500 font-medium mb-2">
            No profile links added yet
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            icon={<Plus size={13} />}
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-semibold"
          >
            Add Profile Link
          </Button>
        </div>
      )}

      {/* Add Profile Modal */}
      <AddProfileModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectType={handleSelectType}
      />

      {/* Change Icon Modal */}
      {activeLinkForPicker && (
        <IconPickerModal
          isOpen={Boolean(activePickerLinkId)}
          currentIcon={activeLinkForPicker.icon || 'link'}
          onSelectIcon={(iconId) => {
            if (activePickerLinkId) {
              handleUpdateLink(activePickerLinkId, { icon: iconId });
            }
          }}
          onClose={() => setActivePickerLinkId(null)}
        />
      )}
    </div>
  );
};
