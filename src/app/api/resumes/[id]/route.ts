import { NextRequest, NextResponse } from 'next/server';
import {
  getResumeFromDB,
  saveResumeToDB,
  deleteResumeFromDB,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/resumes/[id] - retrieves resume JSON directly from PostgreSQL
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const resume = await getResumeFromDB(id);

    if (!resume) {
      return NextResponse.json(
        { error: `Resume "${id}" not found in database` },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);
  } catch (error: any) {
    console.error(`Error loading resume ${params.id} from database:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to load resume from database',
      },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/[id] - updates resume JSON directly in PostgreSQL
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await saveResumeToDB(id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating resume ${params.id} in database:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to update resume in database',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - deletes resume record directly from PostgreSQL
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    await deleteResumeFromDB(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error(`Error deleting resume ${params.id} from database:`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to delete resume from database',
      },
      { status: 500 }
    );
  }
}
