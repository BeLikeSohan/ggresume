'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ResumeData, ResumeDocument } from '@/types/resume';
import { defaultResumeData, emptyResumeData } from '@/data/defaultResume';
import {
  fetchResumesFromDB,
  fetchResumeByIdFromDB,
  updateResumeInDB,
  createResumeInDB,
  duplicateResumeInDB,
} from '@/lib/resumeStorage';

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

  // Initialize and load the resume directly from PostgreSQL
  useEffect(() => {
    let isCancelled = false;

    async function loadFromDB() {
      setIsInitialized(false);
      setError(null);

      try {
        let targetDoc: ResumeDocument | null = null;

        if (targetResumeId) {
          targetDoc = await fetchResumeByIdFromDB(targetResumeId);
        }

        if (!targetDoc) {
          const allResumes = await fetchResumesFromDB();
          if (allResumes.length > 0) {
            targetDoc = allResumes[0];
          }
        }

        if (!targetDoc) {
          // Create initial resume directly in PostgreSQL
          targetDoc = await createResumeInDB({
            title: 'Software Engineer Resume',
            template: 'sample',
          });
        }

        if (!isCancelled && targetDoc) {
          // Normalize docData
          const docData = targetDoc.data || { ...defaultResumeData };
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
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load resume from database:', err);
          setError(err.message || 'Could not connect to database');
        }
      } finally {
        if (!isCancelled) {
          setIsInitialized(true);
        }
      }
    }

    loadFromDB();

    return () => {
      isCancelled = true;
    };
  }, [targetResumeId]);

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
  const saveResume = useCallback(async (): Promise<boolean> => {
    if (!currentId || !isInitialized) return false;

    setIsSaving(true);
    setError(null);

    try {
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
      return true;
    } catch (err: any) {
      console.error('Failed to save resume to database:', err);
      setError(err.message || 'Failed to save to database');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentId, isInitialized, resumeTitle, resumeData]);

  const setResumeTitle = useCallback((title: string) => {
    setResumeTitleState(title);
  }, []);

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
        const mergedData: ResumeData = {
          ...defaultResumeData,
          ...parsed,
          customSections: Array.isArray(parsed.customSections)
            ? parsed.customSections
            : [],
          settings: { ...defaultResumeData.settings, ...(parsed.settings || {}) },
        };
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
    discardChanges,
    clearAll,
    duplicateCurrent,
    exportJson,
    importJson,
  };
}
