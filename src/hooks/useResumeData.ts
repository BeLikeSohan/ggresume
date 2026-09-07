'use client';

import { useState, useEffect, useCallback } from 'react';
import { ResumeData, ResumeDocument } from '@/types/resume';
import { defaultResumeData, emptyResumeData } from '@/data/defaultResume';
import {
  fetchResumesFromDB,
  fetchResumeByIdFromDB,
  updateResumeInDB,
  createResumeInDB,
  duplicateResumeInDB,
} from '@/lib/resumeStorage';

const GUEST_DRAFT_KEY = 'ggresume_guest_draft';

function normalizeResumeData(raw?: any): ResumeData {
  const docData = raw || { ...defaultResumeData };
  if (!Array.isArray(docData.customSections)) {
    docData.customSections = [];
  }
  if (!docData.settings) {
    docData.settings = { ...defaultResumeData.settings };
  }
  if (!Array.isArray(docData.settings.sectionOrder)) {
    docData.settings.sectionOrder = [...defaultResumeData.settings.sectionOrder];
  }
  if (!Array.isArray(docData.settings.hiddenSections)) {
    docData.settings.hiddenSections = [];
  }

  // Clean legacy default pageBreakBefore: ['educations']
  if (
    docData.settings.pageBreakBefore &&
    docData.settings.pageBreakBefore.length === 1 &&
    docData.settings.pageBreakBefore[0] === 'educations'
  ) {
    docData.settings.pageBreakBefore = [];
  }

  return docData;
}

export interface SaveResumeResult {
  success: boolean;
  requiresAuth?: boolean;
  doc?: ResumeDocument;
}

export function useResumeData(targetResumeId?: string) {
  const [currentId, setCurrentId] = useState<string>(targetResumeId || '');
  const [resumeTitle, setResumeTitleState] = useState<string>('Software Engineer Resume');
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep a snapshot string of the saved state to accurately track unsaved changes
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');

  // Helper to load guest draft from local storage
  const loadGuestDraft = useCallback(() => {
    let initialTitle = 'Software Engineer Resume';
    let initialData = defaultResumeData;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(GUEST_DRAFT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.title) initialTitle = parsed.title;
          if (parsed.data) initialData = normalizeResumeData(parsed.data);
        }
      } catch (_) {}
    }

    setCurrentId('');
    setResumeTitleState(initialTitle);
    setResumeData(initialData);
    setLastSaved(null);
    setSavedSnapshot(
      JSON.stringify({
        title: initialTitle,
        data: initialData,
      })
    );
  }, []);

  // Initialize and load the resume (either from DB if authenticated or from guest draft / defaults)
  useEffect(() => {
    let isCancelled = false;

    async function initializeResume() {
      setIsInitialized(false);
      setError(null);

      try {
        let targetDoc: ResumeDocument | null = null;

        if (targetResumeId) {
          // If specific ID was requested, attempt to fetch from DB
          try {
            targetDoc = await fetchResumeByIdFromDB(targetResumeId);
          } catch (e) {
            // Not authenticated or document not found
            targetDoc = null;
          }
        } else {
          // No specific ID requested - check if authenticated user has existing resumes
          try {
            const allResumes = await fetchResumesFromDB();
            if (allResumes.length > 0) {
              targetDoc = allResumes[0];
            } else {
              // User is authenticated but has 0 resumes -> create default in DB
              targetDoc = await createResumeInDB({
                title: 'Software Engineer Resume',
                template: 'sample',
              });
            }
          } catch (e) {
            // Unauthenticated guest user accessing /editor
            targetDoc = null;
          }
        }

        if (isCancelled) return;

        if (targetDoc) {
          // Successfully loaded from database
          const docData = normalizeResumeData(targetDoc.data);
          setCurrentId(targetDoc.id);
          setResumeTitleState(targetDoc.title);
          setResumeData(docData);
          setLastSaved(targetDoc.updatedAt);
          setSavedSnapshot(
            JSON.stringify({
              title: targetDoc.title,
              data: docData,
            })
          );
        } else {
          // Guest mode fallback
          loadGuestDraft();
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Fallback to guest editor mode:', err?.message);
          loadGuestDraft();
        }
      } finally {
        if (!isCancelled) {
          setIsInitialized(true);
        }
      }
    }

    initializeResume();

    return () => {
      isCancelled = true;
    };
  }, [targetResumeId, loadGuestDraft]);

  // Sync draft to local storage in guest mode
  useEffect(() => {
    if (!isInitialized || currentId) return;
    try {
      localStorage.setItem(
        GUEST_DRAFT_KEY,
        JSON.stringify({
          title: resumeTitle,
          data: resumeData,
        })
      );
    } catch (_) {}
  }, [isInitialized, currentId, resumeTitle, resumeData]);

  // Compute if there are unsaved changes
  const currentSnapshot = isInitialized
    ? JSON.stringify({
        title: resumeTitle,
        data: resumeData,
      })
    : '';

  const hasUnsavedChanges =
    isInitialized && savedSnapshot !== '' && currentSnapshot !== savedSnapshot;

  // Warn user on browser reload / tab close if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Explicit Save function
  const saveResume = useCallback(async (): Promise<SaveResumeResult> => {
    if (!isInitialized) return { success: false };

    setIsSaving(true);
    setError(null);

    try {
      if (currentId) {
        // Update existing document in DB
        const updated = await updateResumeInDB(currentId, {
          title: resumeTitle,
          data: resumeData,
        });

        setLastSaved(updated.updatedAt);
        setSavedSnapshot(
          JSON.stringify({
            title: resumeTitle,
            data: resumeData,
          })
        );
        try {
          localStorage.removeItem(GUEST_DRAFT_KEY);
        } catch (_) {}
        return { success: true, doc: updated };
      } else {
        // New document - attempt to create in DB
        const newDoc = await createResumeInDB({
          title: resumeTitle,
          data: resumeData,
        });

        setCurrentId(newDoc.id);
        setLastSaved(newDoc.updatedAt);
        setSavedSnapshot(
          JSON.stringify({
            title: resumeTitle,
            data: resumeData,
          })
        );
        try {
          localStorage.removeItem(GUEST_DRAFT_KEY);
        } catch (_) {}
        return { success: true, doc: newDoc };
      }
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (
        errMsg.includes('401') ||
        errMsg.includes('Unauthorized') ||
        errMsg.includes('Authentication required') ||
        errMsg.includes('signed in')
      ) {
        return { success: false, requiresAuth: true };
      }
      console.error('Failed to save resume to database:', err);
      setError(err.message || 'Failed to save to database');
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, [currentId, isInitialized, resumeTitle, resumeData]);

  // Helper to save current guest state to a newly authenticated account
  const saveAsNewResume = useCallback(
    async (
      overrideTitle?: string,
      overrideData?: ResumeData
    ): Promise<ResumeDocument | null> => {
      setIsSaving(true);
      setError(null);

      const titleToSave = overrideTitle || resumeTitle;
      const dataToSave = overrideData || resumeData;

      try {
        const newDoc = await createResumeInDB({
          title: titleToSave,
          data: dataToSave,
        });

        setCurrentId(newDoc.id);
        setResumeTitleState(newDoc.title);
        setResumeData(newDoc.data);
        setLastSaved(newDoc.updatedAt);
        setSavedSnapshot(
          JSON.stringify({
            title: newDoc.title,
            data: newDoc.data,
          })
        );
        try {
          localStorage.removeItem(GUEST_DRAFT_KEY);
        } catch (_) {}
        return newDoc;
      } catch (err: any) {
        console.error('Failed to save new resume to user account:', err);
        setError(err.message || 'Failed to save resume to account');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [resumeTitle, resumeData]
  );

  const setResumeTitle = useCallback((title: string) => {
    setResumeTitleState(title);
  }, []);

  const loadSample = useCallback(() => {
    const sampleData = normalizeResumeData(defaultResumeData);
    const sampleTitle = 'Software Engineer Resume';
    setResumeTitleState(sampleTitle);
    setResumeData(sampleData);
    setSavedSnapshot(
      JSON.stringify({
        title: sampleTitle,
        data: sampleData,
      })
    );
    if (!currentId && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          GUEST_DRAFT_KEY,
          JSON.stringify({
            title: sampleTitle,
            data: sampleData,
          })
        );
      } catch (_) {}
    }
  }, [currentId]);

  const loadBlank = useCallback(() => {
    const blankData = normalizeResumeData(emptyResumeData);
    const blankTitle = 'Untitled Resume';
    setResumeTitleState(blankTitle);
    setResumeData(blankData);
    setSavedSnapshot(
      JSON.stringify({
        title: blankTitle,
        data: blankData,
      })
    );
    if (!currentId && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          GUEST_DRAFT_KEY,
          JSON.stringify({
            title: blankTitle,
            data: blankData,
          })
        );
      } catch (_) {}
    }
  }, [currentId]);

  const clearAll = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Clear all resume fields to start from a blank slate?')
    ) {
      setResumeData(emptyResumeData);
    }
  }, []);

  const discardChanges = useCallback(() => {
    if (!savedSnapshot) return;
    try {
      const parsed = JSON.parse(savedSnapshot);
      if (parsed.title) setResumeTitleState(parsed.title);
      if (parsed.data) setResumeData(parsed.data);
    } catch (e) {
      console.error('Failed to discard changes:', e);
    }
  }, [savedSnapshot]);

  const duplicateCurrent = useCallback(async (): Promise<ResumeDocument | null> => {
    if (!currentId) return null;
    try {
      // If there are unsaved changes, save first before duplicating
      if (hasUnsavedChanges) {
        await updateResumeInDB(currentId, {
          title: resumeTitle,
          data: resumeData,
        });
        setSavedSnapshot(
          JSON.stringify({
            title: resumeTitle,
            data: resumeData,
          })
        );
      }
      return await duplicateResumeInDB(currentId);
    } catch (err) {
      console.error('Failed to duplicate in database:', err);
      return null;
    }
  }, [currentId, hasUnsavedChanges, resumeTitle, resumeData]);

  const exportJson = useCallback(() => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeName =
      resumeTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_') ||
      resumeData.personal.fullName.trim().replace(/\s+/g, '_') ||
      'resume';
    downloadAnchor.setAttribute('download', `${safeName}-data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [resumeData, resumeTitle]);

  const importJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        const mergedData = normalizeResumeData(parsed);
        setResumeData(mergedData);
      }
    } catch (e) {
      alert('Could not read JSON file. Please ensure it is a valid resume configuration.');
    }
  }, []);

  return {
    resumeId: currentId,
    resumeTitle,
    setResumeTitle,
    resumeData,
    setResumeData,
    isInitialized,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    error,
    saveResume,
    saveAsNewResume,
    loadSample,
    loadBlank,
    discardChanges,
    clearAll,
    duplicateCurrent,
    exportJson,
    importJson,
  };
}
