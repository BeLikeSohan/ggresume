import { ResumeData } from '@/types/resume';

export interface ExportOptions {
  fileName?: string;
  resumeData?: ResumeData;
}

/**
 * Native high-fidelity PDF export via window.print().
 * Awaits web fonts loading, temporarily sets the document title to the target fileName
 * so the browser's "Save as PDF" dialog suggests the candidate's name by default,
 * and triggers the native print dialog.
 */
export async function exportResumeToPdf(
  _element?: HTMLElement | null,
  options: ExportOptions = {}
): Promise<void> {
  const { fileName = 'Resume.pdf' } = options;

  try {
    // 1. Ensure all custom web fonts (Inter, Source Sans 3, EB Garamond, Literata, etc.) are loaded
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }

    // 2. Set document title to desired file name so default save filename in browser is clean
    const originalTitle = typeof document !== 'undefined' ? document.title : '';
    const cleanTitle = fileName.replace(/\.pdf$/i, '');
    if (typeof document !== 'undefined') {
      document.title = cleanTitle;
    }

    // Brief delay to allow DOM and title updates to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 3. Trigger native print
    if (typeof window !== 'undefined') {
      window.print();
    }

    // 4. Restore original document title after print dialog closes
    if (typeof window !== 'undefined') {
      const restoreTitle = () => {
        if (typeof document !== 'undefined') {
          document.title = originalTitle;
        }
        window.removeEventListener('afterprint', restoreTitle);
      };
      window.addEventListener('afterprint', restoreTitle);

      // Fallback timeout to ensure title is restored
      setTimeout(restoreTitle, 2000);
    }
  } catch (error) {
    console.error('Print generation failed:', error);
    throw error;
  }
}

/**
 * Triggers browser's native print dialog with print-specific A4 stylesheets.
 */
export function printResume(options: ExportOptions = {}): void {
  exportResumeToPdf(undefined, options);
}
