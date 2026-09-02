'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ResumeDocument, ResumeData } from '@/types/resume';
import {
  fetchResumesFromRustFS,
  createResumeInRustFS,
  duplicateResumeInRustFS,
  updateResumeInRustFS,
  deleteResumeFromRustFS,
} from '@/lib/resumeStorage';
import { defaultResumeData } from '@/data/defaultResume';
import { DashboardHeader } from './DashboardHeader';
import { ResumeCard } from './ResumeCard';
import { ResumeRow } from './ResumeRow';
import { CreateResumeModal } from './CreateResumeModal';
import { RenameResumeModal } from './RenameResumeModal';
import { DeleteResumeModal } from './DeleteResumeModal';
import { DownloadToast } from '@/components/common/DownloadToast';
import { Button } from '@/components/ui/Button';

type SortOption = 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc';
type ViewMode = 'grid' | 'list';

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load resumes directly from RustFS
  const loadResumes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchResumesFromRustFS();
      setResumes(data);
    } catch (err: any) {
      console.error('Failed to load resumes from RustFS:', err);
      setError(
        err.message ||
          'Unable to connect to RustFS object storage. Please ensure RustFS is running via "docker compose up -d".'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // Filter and sort resumes
  const filteredAndSortedResumes = useMemo(() => {
    let result = [...resumes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const titleMatch = r.title.toLowerCase().includes(q);
        const nameMatch = r.data.personal?.fullName?.toLowerCase().includes(q);
        const emailMatch = r.data.personal?.email?.toLowerCase().includes(q);
        const roleMatch = r.data.experiences?.some((e) =>
          e.role.toLowerCase().includes(q) || e.company.toLowerCase().includes(q)
        );
        const skillMatch = r.data.skills?.some((s) =>
          s.items.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
        );
        return titleMatch || nameMatch || emailMatch || roleMatch || skillMatch;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'updated-desc':
          return b.updatedAt - a.updatedAt;
        case 'updated-asc':
          return a.updatedAt - b.updatedAt;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

    return result;
  }, [resumes, searchQuery, sortBy]);

  // Actions directly on RustFS
  const handleCreate = async (title: string, template: 'sample' | 'blank') => {
    try {
      const newResume = await createResumeInRustFS({ title, template });
      setIsCreateOpen(false);
      router.push(`/editor/${newResume.id}`);
    } catch (e: any) {
      alert(e.message || 'Failed to create resume in RustFS.');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateResumeInRustFS(id);
      await loadResumes();
      showToast(`Duplicated as "${duplicated.title}" in RustFS`);
    } catch (e: any) {
      alert(e.message || 'Failed to duplicate resume in RustFS.');
    }
  };

  const handleRename = async (newTitle: string) => {
    if (!renameTarget) return;
    try {
      await updateResumeInRustFS(renameTarget.id, { title: newTitle });
      await loadResumes();
      showToast('Renamed in RustFS');
      setRenameTarget(null);
    } catch (e: any) {
      alert(e.message || 'Failed to rename resume in RustFS.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResumeFromRustFS(deleteTarget.id);
      await loadResumes();
      showToast('Deleted from RustFS');
      setDeleteTarget(null);
    } catch (e: any) {
      alert(e.message || 'Failed to delete resume from RustFS.');
    }
  };

  const handleExportJson = (resume: ResumeDocument) => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(resume.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeName =
      resume.title.trim().replace(/[^a-zA-Z0-9_-]/g, '_') ||
      resume.data.personal.fullName.trim().replace(/\s+/g, '_') ||
      'resume';
    downloadAnchor.setAttribute('download', `${safeName}-data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported JSON');
  };

  const handleImportJson = async (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        const mergedData: ResumeData = {
          ...defaultResumeData,
          ...parsed,
          settings: { ...defaultResumeData.settings, ...(parsed.settings || {}) },
        };
        const title = mergedData.personal?.fullName?.trim()
          ? `${mergedData.personal.fullName.trim()} - Imported`
          : 'Imported Resume';
        const newDoc = await createResumeInRustFS({
          title,
          data: mergedData,
        });
        await loadResumes();
        router.push(`/editor/${newDoc.id}`);
      }
    } catch (e: any) {
      alert(e.message || 'Invalid JSON file format.');
    }
  };

  const handleRestoreSample = async () => {
    try {
      await createResumeInRustFS({
        title: 'Software Engineer Resume (Sample)',
        template: 'sample',
      });
      await loadResumes();
      showToast('Sample restored in RustFS');
    } catch (e: any) {
      alert(e.message || 'Failed to restore sample in RustFS.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <DashboardHeader
        onCreateNew={() => setIsCreateOpen(true)}
        onImportJson={handleImportJson}
      />

      <DownloadToast message={toastMessage} />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-6">
        {/* Error notification banner if RustFS connection fails */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between gap-3 text-sm text-red-700 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">RustFS Connection Error</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  Start RustFS with: <code className="bg-red-100 px-1 py-0.5 rounded font-mono">docker compose up -d</code>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadResumes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-red-300 text-red-800 rounded-lg hover:bg-red-100 transition flex-shrink-0 shadow-2xs"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes by title, role, or name..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Tools: Count, Sort, View mode */}
          <div className="flex items-center justify-between sm:justify-end gap-3.5 text-sm text-slate-600">
            <span className="font-medium text-xs sm:text-sm">
              {resumes.length} {resumes.length === 1 ? 'document' : 'documents'}
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="updated-desc">Recently edited</option>
              <option value="updated-asc">Oldest</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center h-10 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'list'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List view"
                aria-label="List view"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Resumes Content */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center max-w-sm mx-auto my-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading resumes directly from RustFS...</p>
          </div>
        ) : resumes.length === 0 && !error ? (
          /* Empty state */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">No resumes in RustFS</h3>
              <p className="text-xs text-slate-500 mt-1">
                Create a new resume from scratch or load the standard template into RustFS.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
              >
                New resume
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreSample}
              >
                Load sample
              </Button>
            </div>
          </div>
        ) : filteredAndSortedResumes.length === 0 && !error ? (
          /* Search returned 0 */
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-sm mx-auto my-12 space-y-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">
              No results for &quot;{searchQuery}&quot;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
            >
              Clear search
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* New Resume Card */}
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="group min-h-[290px] rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-800 bg-white/70 hover:bg-white transition-all flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-2xs"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700 flex items-center justify-center transition shadow-2xs">
                <Plus size={20} />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800 group-hover:text-slate-950">
                  New resume
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Blank or sample template
                </span>
              </div>
            </button>

            {/* Resume Cards */}
            {filteredAndSortedResumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDuplicate={handleDuplicate}
                onRename={(id, title) => setRenameTarget({ id, title })}
                onDelete={(id, title) => setDeleteTarget({ id, title })}
                onExportJson={handleExportJson}
              />
            ))}
          </div>
        ) : (
          /* List View (Table rows) */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <span className="flex-1">Title</span>
              <span className="hidden sm:block w-56">Candidate / Role</span>
              <span className="w-32 text-right sm:text-left">Edited</span>
              <span className="w-24 text-right">Actions</span>
            </div>
            {filteredAndSortedResumes.map((resume) => (
              <ResumeRow
                key={resume.id}
                resume={resume}
                onDuplicate={handleDuplicate}
                onRename={(id, title) => setRenameTarget({ id, title })}
                onDelete={(id, title) => setDeleteTarget({ id, title })}
                onExportJson={handleExportJson}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateResumeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      <RenameResumeModal
        isOpen={Boolean(renameTarget)}
        initialTitle={renameTarget?.title || ''}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
      />

      <DeleteResumeModal
        isOpen={Boolean(deleteTarget)}
        resumeTitle={deleteTarget?.title || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
