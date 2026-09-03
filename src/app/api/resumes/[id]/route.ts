import { NextRequest, NextResponse } from 'next/server';
import {
  getResumeFromDB,
  saveResumeToDB,
  deleteResumeFromDB,
} from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession();
  if (session?.id) return session.id;

  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) return headerUserId;

  return null;
}

// GET /api/resumes/[id] - retrieves resume JSON belonging to authenticated user
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const resume = await getResumeFromDB(id, userId);

    if (!resume) {
      return NextResponse.json(
        { error: `Resume "${id}" not found or unauthorized` },
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

// PUT /api/resumes/[id] - updates resume JSON scoped to authenticated user
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const updated = await saveResumeToDB(id, body, userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating resume ${params.id} in database:`, error);
    const isForbidden = error?.message?.includes('Forbidden');
    return NextResponse.json(
      {
        error: error?.message || 'Failed to update resume in database',
      },
      { status: isForbidden ? 403 : 500 }
    );
  }
}

// DELETE /api/resumes/[id] - deletes resume record scoped to authenticated user
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const deleted = await deleteResumeFromDB(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: `Resume "${id}" not found or unauthorized` },
        { status: 404 }
      );
    }

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
