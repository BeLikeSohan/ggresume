'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeZoom } from '@/hooks/useResumeZoom';
import { Header } from '@/components/common/Header';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import { ResumePreview } from '@/components/preview/ResumePreview';
import { PreviewToolbar } from '@/components/preview/PreviewToolbar';
import { DownloadToast } from '@/components/common/DownloadToast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { exportResumeToPdf } from '@/lib/pdfExport';

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
    clearAll,
    exportJson,
    importJson,
    duplicateCurrent,
  } = useResumeData(resumeId);

  const { scale, zoomIn, zoomOut, resetZoom } = useResumeZoom();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  const previewRef = useRef<HTMLDivElement>(null);

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    setDownloadStatus('Preparing PDF...');

    try {
      const fileName = `${
        resumeData.personal.fullName.trim().replace(/\s+/g, '_') || 'Candidate'
      }-Resume.pdf`;

      await exportResumeToPdf(previewRef.current, {
        fileName,
        resumeData,
        onProgress: (status) => setDownloadStatus(status),
      });

      setDownloadStatus('Downloaded successfully!');
      setTimeout(() => setDownloadStatus(null), 3500);
    } catch (error) {
      console.error(error);
      alert('Could not export PDF. Please try again!');
      setDownloadStatus(null);
    } finally {
      setIsDownloading(false);
    }
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
        onDownloadPdf={handleDownloadPdf}
        onClear={clearAll}
        onExportJson={exportJson}
        onImportJson={importJson}
        isDownloading={isDownloading}
        mobileView={mobileView}
        setMobileView={setMobileView}
      />

      {/* Notification Toast */}
      <DownloadToast message={downloadStatus} />

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
          className={`w-full lg:w-[52%] xl:w-[56%] h-full flex flex-col bg-slate-200/90 overflow-hidden relative ${
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
          <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start scrollbar-thin">
            <div className="my-2">
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
