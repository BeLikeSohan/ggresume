import { NextRequest, NextResponse } from 'next/server';
import {
  listResumesFromRustFS,
  saveResumeToRustFSStorage,
} from '@/lib/rustfsClient';

export const dynamic = 'force-dynamic';

// GET /api/resumes - fetches all resumes stored directly as JSON in RustFS
export async function GET() {
  try {
    const resumes = await listResumesFromRustFS();
    return NextResponse.json(resumes);
  } catch (error: any) {
    console.error('Error fetching resumes from RustFS:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to connect to RustFS storage',
      },
      { status: 500 }
    );
  }
}

// POST /api/resumes - saves a new resume JSON directly into RustFS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `res_${Date.now()}`;
    const saved = await saveResumeToRustFSStorage(id, body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error saving resume to RustFS:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to save resume JSON to RustFS',
      },
      { status: 500 }
    );
  }
}
