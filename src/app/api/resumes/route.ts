import { NextRequest, NextResponse } from 'next/server';
import {
  listResumesFromDB,
  saveResumeToDB,
} from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession();
  if (session?.id) return session.id;

  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) return headerUserId;

  return null;
}

// GET /api/resumes - fetches all resumes belonging to the authenticated user
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to view resumes.' },
        { status: 401 }
      );
    }

    const resumes = await listResumesFromDB(userId);
    return NextResponse.json(resumes);
  } catch (error: any) {
    console.error('Error fetching user resumes from database:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch resumes from PostgreSQL database',
      },
      { status: 500 }
    );
  }
}

// POST /api/resumes - saves a new resume JSON directly into PostgreSQL under the authenticated user
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to create resumes.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const id = body.id || `res_${Date.now()}`;
    const saved = await saveResumeToDB(id, body, userId);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error saving resume to database:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to save resume JSON to PostgreSQL database',
      },
      { status: error?.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
