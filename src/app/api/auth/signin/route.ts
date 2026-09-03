import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailFromDB } from '@/lib/db';
import {
  verifyPassword,
  createSessionToken,
  isEmailVerificationRequired,
  SESSION_COOKIE_NAME,
  UserSession,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await getUserByEmailFromDB(email);
    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const requireVerification = isEmailVerificationRequired();
    if (requireVerification && !user.email_verified) {
      return NextResponse.json(
        {
          error: 'Please verify your email address before signing in.',
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      provider: user.provider,
      emailVerified: user.email_verified,
    };

    const token = createSessionToken(userSession);

    const response = NextResponse.json({
      message: 'Signed in successfully',
      user: userSession,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Error during sign in:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during sign in.' },
      { status: 500 }
    );
  }
}
