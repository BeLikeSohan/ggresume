'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeZoom } from '@/hooks/useResumeZoom';
import { Header } from '@/components/common/Header';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import { ResumePreview } from '@/components/preview/ResumePreview';
import { PreviewToolbar } from '@/components/preview/PreviewToolbar';
import { DownloadToast } from '@/components/common/DownloadToast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { UnsavedChangesModal } from '@/components/common/UnsavedChangesModal';
import { ServerPdfModal } from '@/components/common/ServerPdfModal';
import {
  saveResumeAsPdfClient,
  downloadResumePdfServer,
} from '@/lib/pdfExport';

interface ResumeBuilderProps {
  resumeId?: string;
}

export function ResumeBuilder({ resumeId }: ResumeBuilderProps = {}) {
  const router = useRouter();

  const {
    resumeTitle,
    setResumeTitle,
    resumeData,
    setResumeData,
    isInitialized,
    isSaving,
    hasUnsavedChanges,
    saveResume,
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

  const previewRef = useRef<HTMLDivElement>(null);

  // Helper to generate formatted filename
  const getPdfFileName = () => {
    return `${
      resumeData.personal.fullName.trim().replace(/\s+/g, '_') || 'Candidate'
    }-Resume.pdf`;
  };

  // Manual save handler from Header
  const handleSave = async () => {
    const success = await saveResume();
    if (success) {
      setDownloadStatus('Changes saved');
      setTimeout(() => setDownloadStatus(null), 2500);
    } else {
      setDownloadStatus('Failed to save changes');
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  // Back button handler: intercept if dirty
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setIsUnsavedModalOpen(true);
    } else {
      router.push('/dashboard');
    }
  }, [hasUnsavedChanges, router]);

  // Modal actions
  const handleDiscardAndExit = useCallback(() => {
    discardChanges();
    setIsUnsavedModalOpen(false);
    router.push('/dashboard');
  }, [discardChanges, router]);

  const handleSaveAndExit = useCallback(async () => {
    const success = await saveResume();
    if (success) {
      setIsUnsavedModalOpen(false);
      router.push('/dashboard');
    }
  }, [saveResume, router]);

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

  // Duplicate current resume and transition to the new copy
  const handleDuplicate = async () => {
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
          {/* Preview Toolbar with Zoom */}
          <PreviewToolbar
            scale={scale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomReset={resetZoom}
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
    </div>
  );
}

export default ResumeBuilder;
