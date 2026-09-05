import { NextRequest, NextResponse } from 'next/server';
import { generateResumePdf } from '@/lib/pdfServer';
import { ResumeData } from '@/types/resume';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ExportPdfRequestBody {
  html?: string;
  styles?: string;
  resumeData?: ResumeData;
  fileName?: string;
}

export async function POST(req: NextRequest) {
  const isServerPdfEnabled =
    process.env.ENABLE_SERVER_PDF === 'true' ||
    process.env.ENABLE_SERVER_PDF === '1' ||
    process.env.NEXT_PUBLIC_ENABLE_SERVER_PDF === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_SERVER_PDF === '1';

  if (!isServerPdfEnabled) {
    return NextResponse.json(
      { error: 'Server-side PDF export is currently disabled.' },
      { status: 403 }
    );
  }

  try {
    const body: ExportPdfRequestBody = await req.json();
    const { html, styles, resumeData, fileName = 'Resume.pdf' } = body;

    if (!html && !resumeData) {
      return NextResponse.json(
        { error: 'Either html or resumeData must be provided in request body.' },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateResumePdf({
      html,
      extraStyles: styles,
      resumeData,
      title: fileName,
    });

    const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    const buffer = Buffer.from(pdfBuffer);
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFileName)}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('API /api/export-pdf error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate PDF on server.',
      },
      { status: 500 }
    );
  }
}
