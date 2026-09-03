import { NextRequest, NextResponse } from 'next/server';
import {
  listResumesFromDB,
  saveResumeToDB,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/resumes - fetches all resumes directly from PostgreSQL
export async function GET() {
  try {
    const resumes = await listResumesFromDB();
    return NextResponse.json(resumes);
  } catch (error: any) {
    console.error('Error fetching resumes from database:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch resumes from PostgreSQL database',
      },
      { status: 500 }
    );
  }
}

// POST /api/resumes - saves a new resume JSON directly into PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `res_${Date.now()}`;
    const saved = await saveResumeToDB(id, body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error saving resume to database:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to save resume JSON to PostgreSQL database',
      },
      { status: 500 }
    );
  }
}
