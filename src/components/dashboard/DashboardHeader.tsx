'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

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
    <header className="app-header h-14 sm:h-16 bg-white border-b border-slate-200 px-3.5 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs flex-shrink-0">
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
          className="hidden sm:inline-flex"
        >
          <span>Import JSON</span>
        </Button>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={onCreateNew}
          className="hidden sm:inline-flex font-semibold shadow-xs"
        >
          <span>New Resume</span>
        </Button>

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
            title={user?.email || 'Account menu'}
            aria-label="Account menu"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center uppercase shadow-xs">
              {user?.email ? user.email.charAt(0) : <UserIcon size={14} />}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-52 sm:w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
              {user && (
                <div className="px-3.5 py-2.5 sm:px-3 sm:py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">{user.email.split('@')[0]}</p>
                  <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
                </div>
              )}

              {/* Mobile-only action items */}
              <div className="sm:hidden border-b border-slate-100 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onCreateNew();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2.5 transition font-medium cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    <Plus size={13} />
                  </div>
                  <span className="font-semibold text-slate-900">New Resume</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-800 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2.5 transition font-medium cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <Upload size={13} />
                  </div>
                  <span>Import JSON</span>
                </button>
              </div>

              {user ? (
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="w-full text-left px-3.5 py-2.5 sm:px-3 sm:py-2 text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-2 transition font-medium cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
