import { NextRequest, NextResponse } from 'next/server';
import {
  getResumeFromDB,
  saveResumeToDB,
  deleteResumeFromDB,
  isPostgresConfigured,
} from '@/lib/db';
import {
  getResumeFromRustFS,
  saveResumeToRustFSStorage,
  deleteResumeFromRustFSStorage,
} from '@/lib/rustfsClient';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/resumes/[id] - retrieves resume by ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (isPostgresConfigured()) {
      try {
        const resume = await getResumeFromDB(id);
        if (resume) {
          return NextResponse.json(resume);
        }
      } catch (dbErr) {
        console.warn(`PostgreSQL get failed for ${id}, attempting RustFS:`, dbErr);
      }
    }

    const resume = await getResumeFromRustFS(id);
    if (!resume) {
      return NextResponse.json(
        { error: `Resume "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);
  } catch (error: any) {
    console.error(`Error loading resume ${params.id}:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to load resume',
      },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/[id] - updates resume by ID
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();

    if (isPostgresConfigured()) {
      try {
        const updated = await saveResumeToDB(id, body);
        return NextResponse.json(updated);
      } catch (dbErr) {
        console.warn(`PostgreSQL update failed for ${id}, attempting RustFS:`, dbErr);
      }
    }

    const updated = await saveResumeToRustFSStorage(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating resume ${params.id}:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to update resume',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - deletes resume by ID
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (isPostgresConfigured()) {
      try {
        await deleteResumeFromDB(id);
        return NextResponse.json({ success: true, id });
      } catch (dbErr) {
        console.warn(`PostgreSQL delete failed for ${id}, attempting RustFS:`, dbErr);
      }
    }

    await deleteResumeFromRustFSStorage(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error(`Error deleting resume ${params.id}:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to delete resume',
      },
      { status: 500 }
    );
  }
}
