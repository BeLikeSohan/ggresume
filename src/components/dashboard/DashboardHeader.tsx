'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Upload, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GGLogo } from '@/components/common/GGLogo';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  onCreateNew: () => void;
  onImportJson: (jsonString: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onCreateNew,
  onImportJson,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

      <div className="flex items-center gap-2 sm:gap-3">
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

        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-700"
              title={user.email}
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center uppercase">
                {user.email.charAt(0)}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">{user.email.split('@')[0]}</p>
                  <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
