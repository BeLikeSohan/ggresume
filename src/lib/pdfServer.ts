import puppeteer from 'puppeteer';
import { RESUME_PDF_STYLES } from './pdfStyles';
import { ResumeData } from '@/types/resume';

export interface GeneratePdfOptions {
  html?: string;
  extraStyles?: string;
  resumeData?: ResumeData;
  title?: string;
}

export function buildResumeHtml(options: {
  content: string;
  extraStyles?: string;
  title?: string;
}): string {
  const { content, extraStyles = '', title = 'Resume' } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Roboto:wght@300;400;500;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <style>
    :root {
      --font-inter: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      --font-source-sans: "Source Sans 3", "Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif;
    }
    ${RESUME_PDF_STYLES}
    ${extraStyles}
    .resume-page header,
    .resume-header,
    header.resume-header {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  </style>
</head>
<body class="bg-white text-black antialiased font-sans">
  ${content}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function generateResumePdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const { html, extraStyles = '', resumeData, title = 'Resume' } = options;

  // 1. Resolve content: client-captured HTML snapshot
  const contentHtml = html;
  if (!contentHtml) {
    throw new Error('No HTML content provided for PDF generation.');
  }

  // 2. Wrap into standalone self-contained document
  const fullDocumentHtml = buildResumeHtml({
    content: contentHtml,
    extraStyles,
    title,
  });

  // 3. Launch headless Chrome via Puppeteer with optimized performance flags
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  let page;
  try {
    page = await browser.newPage();

    // Set A4-proportional viewport at 2x scale for ultra-crisp vector/font rendering
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    // Set content and wait for load event
    await page.setContent(fullDocumentHtml, {
      waitUntil: 'load',
      timeout: 30000,
    });

    // Wait until network is idle (e.g. Google Fonts downloaded) and fonts are fully parsed
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 }).catch(() => {
      // If network idle times out, proceed anyway as document.fonts.ready will guard font loading
    });

    // Wait until all web fonts are fully parsed and ready in the document
    await page.evaluateHandle('document.fonts.ready');

    // Give browser brief microtick to finalize layout metrics
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Emulate print media so @media print and CSS page breaks take effect
    await page.emulateMediaType('print');

    // Generate exact A4 PDF using native Chromium Skia print pipeline
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });

    return pdfBuffer;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
