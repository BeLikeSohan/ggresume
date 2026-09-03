import { NextRequest, NextResponse } from 'next/server';
import {
  getVerificationTokenFromDB,
  deleteVerificationTokenFromDB,
  markUserEmailVerifiedInDB,
  getUserByIdFromDB,
} from '@/lib/db';
import { createSessionToken, SESSION_COOKIE_NAME, UserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const origin =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    req.nextUrl.origin ||
    'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${origin}/?auth=signin&error=missing_token`);
  }

  try {
    const record = await getVerificationTokenFromDB(token);
    if (!record) {
      return NextResponse.redirect(
        `${origin}/?auth=signin&error=invalid_or_expired_token`
      );
    }

    if (new Date() > new Date(record.expires_at)) {
      await deleteVerificationTokenFromDB(token);
      return NextResponse.redirect(
        `${origin}/?auth=signin&error=token_expired`
      );
    }

    // Verify user in DB
    await markUserEmailVerifiedInDB(record.user_id);
    await deleteVerificationTokenFromDB(token);

    const user = await getUserByIdFromDB(record.user_id);
    if (!user) {
      return NextResponse.redirect(`${origin}/?auth=signin&verified=true`);
    }

    // Create session
    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      provider: user.provider,
      emailVerified: true,
    };

    const sessionToken = createSessionToken(userSession);

    const response = NextResponse.redirect(
      `${origin}/dashboard?verified=true`
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Error verifying email token:', err);
    return NextResponse.redirect(
      `${origin}/?auth=signin&error=verification_failed`
    );
  }
}
