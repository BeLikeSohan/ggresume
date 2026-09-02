'use client';

import React, { useState } from 'react';
import { CustomSection, CustomSectionItem } from '@/types/resume';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Layers, Plus, Trash2 } from 'lucide-react';

export interface CustomSectionsEditorProps {
  customSections: CustomSection[];
  onChange: (customSections: CustomSection[]) => void;
  onAddSectionToOrder: (sectionId: string) => void;
  onRemoveSectionFromOrder: (sectionId: string) => void;
}

export const CustomSectionsEditor: React.FC<CustomSectionsEditorProps> = ({
  customSections,
  onChange,
  onAddSectionToOrder,
  onRemoveSectionFromOrder,
}) => {
  const [newTitle, setNewTitle] = useState('');

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSecId = `custom-${Date.now()}`;
    const newSec: CustomSection = {
      id: newSecId,
      title: newTitle.trim(),
      items: [
        {
          id: `item-${Date.now()}`,
          title: 'Item Title / Award / Certification',
          subtitle: 'Issuing Organization',
          date: '2024',
          description: 'Description of key achievements or scope.',
          highlights: [],
        },
      ],
    };

    onChange([...customSections, newSec]);
    onAddSectionToOrder(newSecId);
    setNewTitle('');
  };

  const handleDeleteSection = (id: string) => {
    onChange(customSections.filter((s) => s.id !== id));
    onRemoveSectionFromOrder(id);
  };

  const handleUpdateSectionTitle = (id: string, title: string) => {
    onChange(customSections.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const handleAddItem = (sectionId: string) => {
    onChange(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          const newItem: CustomSectionItem = {
            id: `item-${Date.now()}`,
            title: 'New Item',
            subtitle: '',
            date: '',
            description: '',
            highlights: [],
          };
          return { ...sec, items: [...sec.items, newItem] };
        }
        return sec;
      })
    );
  };

  const handleUpdateItem = (
    sectionId: string,
    itemId: string,
    field: keyof CustomSectionItem,
    val: any
  ) => {
    onChange(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map((it) => (it.id === itemId ? { ...it, [field]: val } : it)),
          };
        }
        return sec;
      })
    );
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    onChange(
      customSections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.filter((it) => it.id !== itemId),
          };
        }
        return sec;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Layers size={16} className="text-slate-500" />
          Custom Sections
        </h3>
        <p className="text-xs text-slate-500">
          Add custom sections like Certifications, Awards, Open Source, or Publications.
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
        >
          Add Section
        </Button>
      </form>

      {/* List of Custom Sections */}
      <div className="space-y-4 pt-2">
        {customSections.map((sec) => (
          <div
            key={sec.id}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <input
                type="text"
                value={sec.title}
                onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                className="font-bold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Plus size={12} />}
                  onClick={() => handleAddItem(sec.id)}
                  className="text-xs"
                >
                  Add Item
                </Button>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(sec.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition"
                  title="Delete this entire section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {sec.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-700">Item Details</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(sec.id, item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Title / Certificate Name"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdateItem(sec.id, item.id, 'title', e.target.value)
                      }
                      className="text-xs py-1"
                    />
                    <Input
                      placeholder="Organization / Issuer (Optional)"
                      value={item.subtitle || ''}
                      onChange={(e) =>
                        handleUpdateItem(sec.id, item.id, 'subtitle', e.target.value)
                      }
                      className="text-xs py-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Date (e.g. 2024)"
                      value={item.date || ''}
                      onChange={(e) =>
                        handleUpdateItem(sec.id, item.id, 'date', e.target.value)
                      }
                      className="text-xs py-1"
                    />
                    <Input
                      placeholder="Location / Link (Optional)"
                      value={item.location || ''}
                      onChange={(e) =>
                        handleUpdateItem(sec.id, item.id, 'location', e.target.value)
                      }
                      className="text-xs py-1"
                    />
                  </div>

                  <Input
                    placeholder="Short description or credential ID"
                    value={item.description || ''}
                    onChange={(e) =>
                      handleUpdateItem(sec.id, item.id, 'description', e.target.value)
                    }
                    className="text-xs py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
