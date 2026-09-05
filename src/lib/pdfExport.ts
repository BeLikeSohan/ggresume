import { ResumeData } from '@/types/resume';

export interface ExportOptions {
  fileName?: string;
  resumeData?: ResumeData;
  onProgress?: (status: string) => void;
}

/**
 * Extracts active CSS rules from the document's stylesheets
 * to ensure that all dynamically injected classes and custom properties
 * are passed to the server-side headless browser.
 */
export function extractClientStyles(): string {
  if (typeof document === 'undefined') return '';

  const styles: string[] = [];

  // 1. Gather all inline <style> tags
  document.querySelectorAll('style').forEach((styleEl) => {
    if (styleEl.textContent) {
      styles.push(styleEl.textContent);
    }
  });

  // 2. Gather stylesheet rules from same-origin CSSStyleSheets
  try {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          const ruleTexts = Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
          styles.push(ruleTexts);
        }
      } catch {
        // Cross-origin stylesheet access restricted; ignore safely
      }
    });
  } catch {
    // Ignore any unexpected stylesheet inspection errors
  }

  return styles.join('\n');
}

/**
 * Client-side native high-fidelity PDF export via window.print().
 * Awaits web fonts loading, temporarily sets the document title to the target fileName
 * so the browser's "Save as PDF" dialog suggests the candidate's name by default,
 * and triggers the native print dialog.
 */
export async function saveResumeAsPdfClient(
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
    await new Promise((resolve) => setTimeout(resolve, 60));

    // 3. Trigger native print dialog
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
    console.error('Client PDF print failed:', error);
    throw error;
  }
}

/**
 * Server-side high-fidelity PDF export using headless Chromium (Puppeteer).
 * Sends the rendered resume DOM snapshot and resume data to the /api/export-pdf
 * route handler, where Chrome renders it natively via page.pdf().
 */
export async function downloadResumePdfServer(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { fileName = 'Resume.pdf', resumeData, onProgress } = options;

  try {
    onProgress?.('Capturing document snapshot...');

    // Ensure all web fonts are loaded in the client before capturing DOM
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }

    // Capture the outer HTML of the resume container or pages
    const html = element.outerHTML || element.innerHTML;
    const clientStyles = extractClientStyles();

    onProgress?.('Generating PDF on server...');

    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        styles: clientStyles,
        resumeData,
        fileName,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Response was not JSON
      }
      throw new Error(errorMessage);
    }

    onProgress?.('Downloading PDF file...');

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Clean up blob URL after small delay
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);

    onProgress?.('Download complete!');
  } catch (error) {
    console.error('Server PDF export failed:', error);
    throw error;
  }
}

/**
 * Default export helper (client-side print to PDF).
 */
export async function exportResumeToPdf(
  element?: HTMLElement | null,
  options: ExportOptions = {}
): Promise<void> {
  return saveResumeAsPdfClient(element, options);
}

/**
 * Alias for client-side print dialog.
 */
export function printResume(options: ExportOptions = {}): void {
  saveResumeAsPdfClient(undefined, options);
}
