'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeZoom } from '@/hooks/useResumeZoom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/common/Header';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import { ResumePreview } from '@/components/preview/ResumePreview';
import { PreviewToolbar } from '@/components/preview/PreviewToolbar';
import { DownloadToast } from '@/components/common/DownloadToast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { UnsavedChangesModal } from '@/components/common/UnsavedChangesModal';
import { ServerPdfModal } from '@/components/common/ServerPdfModal';
import { ThemeModal } from '@/components/common/ThemeModal';
import { AuthModal } from '@/components/landing/AuthModal';
import { StartChoiceModal } from '@/components/editor/StartChoiceModal';
import {
  saveResumeAsPdfClient,
  downloadResumePdfServer,
} from '@/lib/pdfExport';

interface ResumeBuilderProps {
  resumeId?: string;
}

export function ResumeBuilder({ resumeId }: ResumeBuilderProps = {}) {
  const router = useRouter();
  const { user, signOut, reloadSession } = useAuth();

  const {
    resumeId: currentResumeId,
    resumeTitle,
    setResumeTitle,
    resumeData,
    setResumeData,
    isInitialized,
    isSaving,
    hasUnsavedChanges,
    saveResume,
    saveAsNewResume,
    loadSample,
    loadBlank,
    discardChanges,
    clearAll,
    exportJson,
    importJson,
    duplicateCurrent,
  } = useResumeData(resumeId);

  const { scale, zoomIn, zoomOut, resetZoom } = useResumeZoom();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [isServerPdfModalOpen, setIsServerPdfModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Auth modal trigger state for guests saving resume
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [authModalTitle, setAuthModalTitle] = useState<string | undefined>(undefined);
  const [authModalSubtitle, setAuthModalSubtitle] = useState<string | undefined>(undefined);

  // Modal dialog asking user to choose between Sample or Blank Scratch
  const [isStartChoiceModalOpen, setIsStartChoiceModalOpen] = useState(false);

  // Check if starting fresh without a specific resume ID
  React.useEffect(() => {
    if (isInitialized && !resumeId) {
      const choiceMade = sessionStorage.getItem('ggresume_choice_made');
      if (!choiceMade) {
        setIsStartChoiceModalOpen(true);
      }
    }
  }, [isInitialized, resumeId]);

  const handleSelectSample = () => {
    loadSample();
    sessionStorage.setItem('ggresume_choice_made', 'true');
    setIsStartChoiceModalOpen(false);
  };

  const handleSelectScratch = () => {
    loadBlank();
    sessionStorage.setItem('ggresume_choice_made', 'true');
    setIsStartChoiceModalOpen(false);
  };

  const previewRef = useRef<HTMLDivElement>(null);

  // Helper to generate formatted filename
  const getPdfFileName = () => {
    return `${
      resumeData.personal.fullName.trim().replace(/\s+/g, '_') || 'Candidate'
    }-Resume.pdf`;
  };

  // Open Auth Modal helper
  const promptAuthToSave = (
    mode: 'signin' | 'signup' = 'signup',
    title?: string,
    subtitle?: string
  ) => {
    setAuthModalMode(mode);
    setAuthModalTitle(title || 'Save your resume');
    setAuthModalSubtitle(
      subtitle ||
        'Create a free account or sign in to save your resume to the cloud and access it anytime.'
    );
    setIsAuthModalOpen(true);
  };

  // Manual save handler from Header
  const handleSave = async () => {
    if (!user) {
      promptAuthToSave('signup');
      return;
    }

    const result = await saveResume();
    if (result.success) {
      setDownloadStatus('Changes saved');
      setTimeout(() => setDownloadStatus(null), 2500);
    } else if (result.requiresAuth) {
      promptAuthToSave('signup');
    } else {
      setDownloadStatus('Failed to save changes');
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  // Callback when authentication succeeds inside the modal
  const handleAuthSuccess = async (_authUser: any) => {
    setIsAuthModalOpen(false);
    await reloadSession();

    // Immediately save the active in-memory resume under the authenticated user
    const savedDoc = await saveAsNewResume();
    if (savedDoc) {
      setDownloadStatus('Resume saved to your account!');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/editor/${savedDoc.id}`);
      }
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  // Back button handler: intercept if dirty
  const handleBack = useCallback(() => {
    const exitTarget = user ? '/dashboard' : '/';
    if (hasUnsavedChanges) {
      setIsUnsavedModalOpen(true);
    } else {
      router.push(exitTarget);
    }
  }, [hasUnsavedChanges, user, router]);

  // Modal actions
  const handleDiscardAndExit = useCallback(() => {
    discardChanges();
    setIsUnsavedModalOpen(false);
    const exitTarget = user ? '/dashboard' : '/';
    router.push(exitTarget);
  }, [discardChanges, user, router]);

  const handleSaveAndExit = useCallback(async () => {
    if (!user) {
      setIsUnsavedModalOpen(false);
      promptAuthToSave(
        'signup',
        'Save and continue',
        'Create an account or sign in to save your resume before leaving.'
      );
      return;
    }

    const result = await saveResume();
    if (result.success) {
      setIsUnsavedModalOpen(false);
      router.push('/dashboard');
    } else if (result.requiresAuth) {
      setIsUnsavedModalOpen(false);
      promptAuthToSave('signup');
    }
  }, [saveResume, user, router]);

  // Client-Side PDF Save (Browser Print Dialog)
  const handleSavePdfClient = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);

    try {
      const fileName = getPdfFileName();
      await saveResumeAsPdfClient(previewRef.current, {
        fileName,
        resumeData,
      });
    } catch (error) {
      console.error('Client PDF export failed:', error);
      alert('Could not open print dialog. Please try again!');
    } finally {
      setIsDownloading(false);
    }
  };

  // Direct Server-Side PDF Download
  const handleDownloadPdfServerDirect = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    setDownloadStatus('Capturing document snapshot...');

    try {
      const fileName = getPdfFileName();
      await downloadResumePdfServer(previewRef.current, {
        fileName,
        resumeData,
        onProgress: (status) => setDownloadStatus(status),
      });

      setDownloadStatus('Downloaded successfully!');
      setTimeout(() => setDownloadStatus(null), 3500);
    } catch (error: any) {
      console.error('Server PDF generation failed:', error);
      alert(
        error?.message ||
          'Could not generate PDF on server. Please try using "Save as PDF (Browser)" instead.'
      );
      setDownloadStatus(null);
    } finally {
      setIsDownloading(false);
    }
  };

  // Server-Side PDF Trigger (checks production mode for advice modal)
  const handleTriggerServerDownload = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      setIsServerPdfModalOpen(true);
    } else {
      handleDownloadPdfServerDirect();
    }
  };

  // Server PDF Modal Handlers
  const handleModalUseClientSave = () => {
    setIsServerPdfModalOpen(false);
    handleSavePdfClient();
  };

  const handleModalProceedServerDownload = () => {
    setIsServerPdfModalOpen(false);
    handleDownloadPdfServerDirect();
  };

  // Load sample resume data handler
  const handleLoadSample = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Load sample resume data? Any unsaved edits will be replaced with the sample content.')
    ) {
      loadSample();
      setDownloadStatus('Loaded sample resume');
      setTimeout(() => setDownloadStatus(null), 2500);
    }
  }, [loadSample]);

  // Duplicate current resume and transition to the new copy
  const handleDuplicate = async () => {
    if (!user) {
      promptAuthToSave(
        'signup',
        'Duplicate Resume',
        'Sign in or create an account to duplicate and save multiple resumes.'
      );
      return;
    }

    const duplicated = await duplicateCurrent();
    if (duplicated) {
      setDownloadStatus(`Duplicated as "${duplicated.title}"`);
      router.push(`/editor/${duplicated.id}`);
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 font-sans">
        <LoadingSpinner label="Loading resume..." size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Header Navigation Bar */}
      <Header
        resumeTitle={resumeTitle}
        onUpdateTitle={setResumeTitle}
        onDuplicate={handleDuplicate}
        onSavePdfClient={handleSavePdfClient}
        onDownloadPdfServer={handleTriggerServerDownload}
        onDownloadPdf={handleSavePdfClient}
        onLoadSample={handleLoadSample}
        onClear={clearAll}
        onExportJson={exportJson}
        onImportJson={importJson}
        isDownloading={isDownloading}
        mobileView={mobileView}
        setMobileView={setMobileView}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onBack={handleBack}
        user={user}
        onSignIn={() => {
          promptAuthToSave('signin', 'Welcome back', 'Sign in to access your saved resumes and features.');
        }}
        onSignOut={signOut}
      />

      {/* Notification Toast */}
      <DownloadToast message={downloadStatus} />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        isSaving={isSaving}
        onClose={() => setIsUnsavedModalOpen(false)}
        onDiscard={handleDiscardAndExit}
        onSaveAndExit={handleSaveAndExit}
      />

      {/* Production Advice Modal for Server PDF Download */}
      <ServerPdfModal
        isOpen={isServerPdfModalOpen}
        onClose={() => setIsServerPdfModalOpen(false)}
        onUseClientSave={handleModalUseClientSave}
        onProceedServerDownload={handleModalProceedServerDownload}
        isDownloading={isDownloading}
      />

      {/* Start Choice Modal (Sample vs Start from Scratch) */}
      <StartChoiceModal
        isOpen={isStartChoiceModalOpen}
        onSelectSample={handleSelectSample}
        onSelectScratch={handleSelectScratch}
      />

      {/* Auth Modal for Unauthenticated Users trying to Save */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        title={authModalTitle}
        subtitle={authModalSubtitle}
        redirectUrl={currentResumeId ? `/editor/${currentResumeId}` : '/editor'}
        onSuccess={handleAuthSuccess}
      />

      {/* Main Split Body: Left Editor / Right Preview */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Form Editor */}
        <div
          className={`no-print w-full lg:w-[48%] xl:w-[44%] h-full flex flex-col z-10 transition-all ${
            mobileView === 'editor' ? 'block' : 'hidden lg:flex'
          }`}
        >
          <ResumeEditor data={resumeData} onChange={setResumeData} />
        </div>

        {/* Right Side: Live Resume Preview */}
        <div
          className={`preview-column w-full lg:w-[52%] xl:w-[56%] h-full flex flex-col bg-slate-200/90 overflow-hidden relative ${
            mobileView === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Preview Toolbar with Zoom & Theme Trigger */}
          <PreviewToolbar
            scale={scale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomReset={resetZoom}
            templateId={resumeData.settings?.templateId || 'classic'}
            onOpenThemes={() => setIsThemeModalOpen(true)}
          />

          {/* Scrollable Viewport */}
          <div className="preview-viewport flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start scrollbar-thin">
            <div className="preview-inner my-2">
              <ResumePreview
                ref={previewRef}
                data={resumeData}
                scale={scale}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Theme Selection Modal with Live Generated Previews */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTemplateId={resumeData.settings?.templateId || 'classic'}
        resumeData={resumeData}
        onSelectTemplate={(newTemplateId) => {
          setResumeData({
            ...resumeData,
            settings: {
              ...resumeData.settings,
              templateId: newTemplateId,
            },
          });
        }}
      />
    </div>
  );
}

export default ResumeBuilder;
