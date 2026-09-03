import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailFromDB, createUserInDB } from '@/lib/db';
import {
  hashPassword,
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

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await getUserByEmailFromDB(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const requireVerification = isEmailVerificationRequired();
    const emailVerified = !requireVerification; // In local mode, immediately verified

    const user = await createUserInDB({
      email,
      passwordHash,
      provider: 'email',
      emailVerified,
    });

    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      provider: user.provider,
      emailVerified: user.email_verified,
    };

    const token = createSessionToken(userSession);

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: userSession,
        emailVerified: user.email_verified,
      },
      { status: 201 }
    );

    // Set secure HTTP session cookie
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
    console.error('Error during sign up:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
