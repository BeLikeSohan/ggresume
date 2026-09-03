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
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load resume from database:', err);
          setError(err.message || 'Could not connect to database');
        }
      } finally {
        if (!isCancelled) {
          setIsInitialized(true);
          isInitialMount.current = false;
        }
      }
    }

    loadFromDB();

    return () => {
      isCancelled = true;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [targetResumeId]);

  // Direct auto-save to PostgreSQL (debounced 400ms)
  useEffect(() => {
    if (!isInitialized || isInitialMount.current || !currentId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updated = await updateResumeInDB(currentId, {
          title: resumeTitle,
          data: resumeData,
        });
        setLastSaved(updated.updatedAt);
        setError(null);
      } catch (err: any) {
        console.error('Failed to auto-save to database:', err);
        setError(err.message || 'Failed to save to database');
      }
    }, 400);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [resumeData, resumeTitle, currentId, isInitialized]);

  const setResumeTitle = useCallback((title: string) => {
    setResumeTitleState(title);
  }, []);

  const clearAll = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Clear all resume fields to start from a blank slate?')
    ) {
      setResumeData(emptyResumeData);
      if (currentId) {
        try {
          const updated = await updateResumeInDB(currentId, {
            data: emptyResumeData,
          });
          setLastSaved(updated.updatedAt);
        } catch (err: any) {
          console.error('Failed to clear resume in database:', err);
        }
      }
    }
  }, [currentId]);

  const duplicateCurrent = useCallback(async (): Promise<ResumeDocument | null> => {
    if (!currentId) return null;
    try {
      return await duplicateResumeInDB(currentId);
    } catch (err) {
      console.error('Failed to duplicate in database:', err);
      return null;
    }
  }, [currentId]);

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

  const importJson = useCallback(async (jsonString: string) => {
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
        if (currentId) {
          const updated = await updateResumeInDB(currentId, {
            data: mergedData,
          });
          setLastSaved(updated.updatedAt);
        }
        alert('Resume data imported and saved directly to PostgreSQL!');
      }
    } catch (e) {
      alert('Could not read JSON file. Please ensure it is a valid resume configuration.');
    }
  }, [currentId]);

  return {
    resumeId: currentId,
    resumeTitle,
    setResumeTitle,
    resumeData,
    setResumeData,
    isInitialized,
    lastSaved,
    error,
    clearAll,
    duplicateCurrent,
    exportJson,
    importJson,
  };
}
