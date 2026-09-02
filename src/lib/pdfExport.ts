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
function extractClientStyles(): string {
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
 * Server-side high-fidelity PDF export using headless Chromium (Puppeteer).
 * Sends the rendered resume DOM snapshot and resume data to the /api/export-pdf
 * route handler, where Chrome renders it natively via page.pdf().
 */
export async function exportResumeToPdf(
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

    onProgress?.('Connecting to server-side PDF engine...');

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
 * Triggers browser's native print dialog with print-specific A4 stylesheets.
 */
export function printResume(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
