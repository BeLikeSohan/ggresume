import { NextRequest, NextResponse } from 'next/server';
import {
  listResumesFromDB,
  saveResumeToDB,
  isPostgresConfigured,
} from '@/lib/db';
import {
  listResumesFromRustFS,
  saveResumeToRustFSStorage,
} from '@/lib/rustfsClient';

export const dynamic = 'force-dynamic';

// GET /api/resumes - fetches all resumes (PostgreSQL primary, RustFS fallback)
export async function GET() {
  try {
    if (isPostgresConfigured()) {
      try {
        const resumes = await listResumesFromDB();
        return NextResponse.json(resumes);
      } catch (dbErr) {
        console.warn('PostgreSQL query failed, attempting RustFS fallback:', dbErr);
      }
    }

    const resumes = await listResumesFromRustFS();
    return NextResponse.json(resumes);
  } catch (error: any) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch resumes from storage',
      },
      { status: 500 }
    );
  }
}

// POST /api/resumes - creates / saves a new resume JSON
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `res_${Date.now()}`;

    if (isPostgresConfigured()) {
      try {
        const saved = await saveResumeToDB(id, body);
        return NextResponse.json(saved, { status: 201 });
      } catch (dbErr) {
        console.warn('PostgreSQL save failed, attempting RustFS fallback:', dbErr);
      }
    }

    const saved = await saveResumeToRustFSStorage(id, body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to save resume JSON',
      },
      { status: 500 }
    );
  }
}
