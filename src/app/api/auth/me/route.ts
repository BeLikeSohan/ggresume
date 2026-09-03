import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getUserByIdFromDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await getUserByIdFromDB(session.id);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        provider: user.provider,
        emailVerified: user.email_verified,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
