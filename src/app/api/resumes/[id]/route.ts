import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/resumes/[id] - retrieves resume JSON directly from RustFS
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const resume = await getResumeFromRustFS(id);

    if (!resume) {
      return NextResponse.json(
        { error: `Resume "${id}" not found in RustFS` },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);
  } catch (error: any) {
    console.error(`Error loading resume ${params.id} from RustFS:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to load resume from RustFS',
      },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/[id] - updates resume JSON directly in RustFS
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await saveResumeToRustFSStorage(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating resume ${params.id} in RustFS:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to update resume in RustFS',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - deletes resume JSON file directly from RustFS
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    await deleteResumeFromRustFSStorage(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error(`Error deleting resume ${params.id} from RustFS:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to delete resume from RustFS',
      },
      { status: 500 }
    );
  }
}
