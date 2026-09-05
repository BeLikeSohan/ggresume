'use client';

import React, { useState } from 'react';
import { CustomSection, CustomSectionItem } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';
import { RichTextarea } from '@/components/common/RichTextarea';

function highlightsToText(highlights: string[] | undefined): string {
  if (!highlights || highlights.length === 0) return '';
  return highlights.join('\n');
}

function textToHighlights(text: string): string[] {
  if (!text) return [];
  return text.split('\n');
}

export interface CustomSectionsEditorProps {
  customSections: CustomSection[];
  onCreateSection: (title: string, initialItems?: CustomSectionItem[]) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateCustomSections: (customSections: CustomSection[]) => void;
}

const SECTION_PRESETS = [
  {
    title: 'Certifications',
    icon: Award,
    sampleItem: {
      title: 'AWS Certified Solutions Architect – Associate',
      subtitle: 'Amazon Web Services',
      date: '2024',
      location: 'Credential ID: AWS-0012345',
      description: 'Demonstrated expertise in designing distributed, scalable cloud architectures.',
      highlights: [],
    },
  },
  {
    title: 'Awards & Honors',
    icon: Sparkles,
    sampleItem: {
      title: 'First Place – National Hackathon',
      subtitle: 'Tech Innovation Summit',
      date: '2023',
      location: 'San Francisco, CA',
      description: 'Awarded 1st place among 120+ teams for building an AI-powered automated workflow.',
      highlights: [],
    },
  },
  {
    title: 'Publications',
    icon: BookOpen,
    sampleItem: {
      title: 'Distributed Consensus in Edge Computing Networks',
      subtitle: 'IEEE Transactions on Cloud Computing',
      date: '2023',
      location: 'doi:10.1109/TCC.2023.1234567',
      description: 'Co-authored research paper on low-latency consensus protocols in partitioned networks.',
      highlights: [],
    },
  },
];

export const CustomSectionsEditor: React.FC<CustomSectionsEditorProps> = ({
  customSections = [],
  onCreateSection,
  onDeleteSection,
  onUpdateCustomSections,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateSection(newTitle.trim());
    setNewTitle('');
  };

  const handleCreateFromPreset = (preset: (typeof SECTION_PRESETS)[0]) => {
    const initialItem: CustomSectionItem = {
      id: `item-${Date.now()}`,
      ...preset.sampleItem,
    };
    onCreateSection(preset.title, [initialItem]);
    setExpandedItemId(initialItem.id);
  };

  const handleUpdateSectionTitle = (id: string, title: string) => {
    onUpdateCustomSections(
      customSections.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const handleAddItem = (sectionId: string) => {
    const newItemId = `item-${Date.now()}`;
    const newItem: CustomSectionItem = {
      id: newItemId,
      title: 'Item Title / Role / Award',
      subtitle: 'Issuing Organization / Company',
      date: '2024',
      location: '',
      description: '',
      highlights: [],
    };

    onUpdateCustomSections(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return { ...sec, items: [...(sec.items || []), newItem] };
        }
        return sec;
      })
    );
    setExpandedItemId(newItemId);
  };

  const handleUpdateItem = (
    sectionId: string,
    itemId: string,
    field: keyof CustomSectionItem,
    val: any
  ) => {
    onUpdateCustomSections(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: (sec.items || []).map((it) =>
              it.id === itemId ? { ...it, [field]: val } : it
            ),
          };
        }
        return sec;
      })
    );
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    onUpdateCustomSections(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: (sec.items || []).filter((it) => it.id !== itemId),
          };
        }
        return sec;
      })
    );
  };

  const handleMoveItem = (
    sectionId: string,
    itemIndex: number,
    direction: 'up' | 'down'
  ) => {
    const sec = customSections.find((s) => s.id === sectionId);
    if (!sec || !sec.items) return;

    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= sec.items.length) return;

    const newItems = [...sec.items];
    const [moved] = newItems.splice(itemIndex, 1);
    newItems.splice(targetIndex, 0, moved);

    onUpdateCustomSections(
      customSections.map((s) => (s.id === sectionId ? { ...s, items: newItems } : s))
    );
  };

  // Bullet highlights
  const handleAddHighlight = (sectionId: string, itemId: string) => {
    onUpdateCustomSections(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: (sec.items || []).map((it) =>
              it.id === itemId
                ? { ...it, highlights: [...(it.highlights || []), ''] }
                : it
            ),
          };
        }
        return sec;
      })
    );
  };

  const handleUpdateHighlight = (
    sectionId: string,
    itemId: string,
    highlightIndex: number,
    value: string
  ) => {
    onUpdateCustomSections(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: (sec.items || []).map((it) => {
              if (it.id === itemId) {
                const newHighlights = [...(it.highlights || [])];
                newHighlights[highlightIndex] = value;
                return { ...it, highlights: newHighlights };
              }
              return it;
            }),
          };
        }
        return sec;
      })
    );
  };

  const handleDeleteHighlight = (
    sectionId: string,
    itemId: string,
    highlightIndex: number
  ) => {
    onUpdateCustomSections(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: (sec.items || []).map((it) => {
              if (it.id === itemId) {
                const newHighlights = (it.highlights || []).filter(
                  (_, i) => i !== highlightIndex
                );
                return { ...it, highlights: newHighlights };
              }
              return it;
            }),
          };
        }
        return sec;
      })
    );
  };

  const handleBoldHighlight = (
    sectionId: string,
    itemId: string,
    highlightIndex: number,
    inputId: string
  ) => {
    if (typeof document === 'undefined') return;
    const textarea = document.getElementById(inputId) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const sec = customSections.find((s) => s.id === sectionId);
    const it = sec?.items.find((i) => i.id === itemId);
    if (!it) return;

    const currentText = (it.highlights || [])[highlightIndex] || '';
    if (start === end) {
      const updated =
        currentText.substring(0, start) + '**bold text**' + currentText.substring(end);
      handleUpdateHighlight(sectionId, itemId, highlightIndex, updated);
    } else {
      const selected = currentText.substring(start, end);
      const updated =
        currentText.substring(0, start) + `**${selected}**` + currentText.substring(end);
      handleUpdateHighlight(sectionId, itemId, highlightIndex, updated);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Layers size={16} className="text-slate-500" />
          Custom Sections
        </h3>
        <p className="text-xs text-slate-500">
          Add any custom sections like Certifications, Awards, Publications, Volunteering, or Open Source projects.
        </p>
      </div>

      {/* Add New Section Form */}
      <form onSubmit={handleCreateSection} className="flex gap-2">
        <Input
          placeholder="e.g. Certifications, Awards, Publications"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="py-1.5 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="whitespace-nowrap"
          icon={<Plus size={14} />}
          disabled={!newTitle.trim()}
        >
          Add Section
        </Button>
      </form>

      {/* Quick Add Presets if empty or available */}
      {customSections.length === 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div className="text-xs font-semibold text-slate-700">
            Quick Start: Add popular sections in 1 click
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTION_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleCreateFromPreset(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-100 transition shadow-2xs"
                >
                  <Icon size={13} className="text-slate-500" />
                  <span>+ {preset.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* List of Custom Sections */}
      <div className="space-y-4 pt-1">
        {customSections.map((sec) => (
          <div
            key={sec.id}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex-1 mr-3">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                  placeholder="Section Title"
                  className="w-full font-bold text-sm text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none py-0.5 px-1"
                />
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Plus size={13} />}
                  onClick={() => handleAddItem(sec.id)}
                  className="text-xs py-1"
                >
                  Add Item
                </Button>
                <button
                  type="button"
                  onClick={() => onDeleteSection(sec.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition rounded hover:bg-red-50"
                  title="Delete this entire section"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Items under this section */}
            {(!sec.items || sec.items.length === 0) ? (
              <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">No items in this section yet.</p>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Plus size={12} />}
                  onClick={() => handleAddItem(sec.id)}
                  className="text-xs"
                >
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sec.items.map((item, itemIndex) => {
                  const isExpanded = expandedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs"
                    >
                      {/* Item Header / Summary Bar */}
                      <div
                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100 bg-slate-50/60"
                        onClick={() =>
                          setExpandedItemId(isExpanded ? null : item.id)
                        }
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="font-semibold text-xs text-slate-800 truncate">
                            {item.title || 'Untitled Item'}
                          </span>
                          {item.subtitle && (
                            <span className="text-[11px] text-slate-500 italic truncate">
                              – {item.subtitle}
                            </span>
                          )}
                          {item.date && (
                            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                              ({item.date})
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-1 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleMoveItem(sec.id, itemIndex, 'up')}
                            disabled={itemIndex === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                            title="Move up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(sec.id, itemIndex, 'down')}
                            disabled={itemIndex === sec.items.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                            title="Move down"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(sec.id, item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition ml-1"
                            title="Delete item"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.id)
                            }
                            className="p-1 text-slate-500 hover:text-slate-900 transition ml-1"
                          >
                            {isExpanded ? (
                              <ChevronUp size={15} />
                            ) : (
                              <ChevronDown size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Item Fields (Expanded) */}
                      {isExpanded && (
                        <div className="p-3.5 space-y-3 bg-slate-50/40">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <Input
                              label="Title / Award / Certificate"
                              placeholder="e.g. AWS Certified Solutions Architect"
                              value={item.title}
                              onChange={(e) =>
                                handleUpdateItem(sec.id, item.id, 'title', e.target.value)
                              }
                              className="text-xs"
                            />
                            <Input
                              label="Organization / Issuer (Optional)"
                              placeholder="e.g. Amazon Web Services"
                              value={item.subtitle || ''}
                              onChange={(e) =>
                                handleUpdateItem(sec.id, item.id, 'subtitle', e.target.value)
                              }
                              className="text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <Input
                              label="Date / Period (Optional)"
                              placeholder="e.g. 2024 or May 2023 - Present"
                              value={item.date || ''}
                              onChange={(e) =>
                                handleUpdateItem(sec.id, item.id, 'date', e.target.value)
                              }
                              className="text-xs"
                            />
                            <Input
                              label="Location / Link / ID (Optional)"
                              placeholder="e.g. San Francisco, CA or Credential ID"
                              value={item.location || ''}
                              onChange={(e) =>
                                handleUpdateItem(sec.id, item.id, 'location', e.target.value)
                              }
                              className="text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                              Description / Summary (Optional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="e.g. Brief summary or credential details. Supports **bold** text."
                              value={item.description || ''}
                              onChange={(e) =>
                                handleUpdateItem(sec.id, item.id, 'description', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent leading-relaxed"
                            />
                          </div>

                          {/* Bullet Highlights */}
                          <div className="pt-2 border-t border-slate-200">
                            <RichTextarea
                              label="Bullet Points (Optional)"
                              helperText="Each line or bullet point is rendered with your chosen bullet marker."
                              placeholder={`• Achieved top 5% score in **Cloud Architecture**.\n• Completed 40+ hours of hands-on laboratory implementation.`}
                              rows={3}
                              value={highlightsToText(item.highlights)}
                              onChange={(text) =>
                                handleUpdateItem(
                                  sec.id,
                                  item.id,
                                  'highlights',
                                  textToHighlights(text)
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
