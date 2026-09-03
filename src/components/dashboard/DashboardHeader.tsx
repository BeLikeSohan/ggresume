'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GGLogo } from '@/components/common/GGLogo';

interface DashboardHeaderProps {
  onCreateNew: () => void;
  onImportJson: (jsonString: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onCreateNew,
  onImportJson,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportJson(text);
      } catch (err) {
        alert('Could not read JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="app-header h-16 bg-white border-b border-slate-200 px-4 md:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs flex-shrink-0">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center group select-none"
          title="GGResume Home"
        >
          <GGLogo size="md" variant="big" showWordmark={false} />
        </Link>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2.5">
        <Button
          size="sm"
          variant="outline"
          icon={<Upload size={14} />}
          onClick={() => fileInputRef.current?.click()}
          title="Import resume from JSON file"
        >
          <span className="hidden sm:inline">Import JSON</span>
          <span className="sm:hidden">Import</span>
        </Button>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={onCreateNew}
          className="font-semibold shadow-xs"
        >
          <span>New Resume</span>
        </Button>
      </div>
    </header>
  );
};
