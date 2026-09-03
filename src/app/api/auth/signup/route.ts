import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmailFromDB, createUserInDB, createVerificationTokenInDB } from '@/lib/db';
import {
  hashPassword,
  createSessionToken,
  isEmailVerificationRequired,
  SESSION_COOKIE_NAME,
  UserSession,
} from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await getUserByEmailFromDB(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const requireVerification = isEmailVerificationRequired();

    if (requireVerification) {
      // Create user with unverified email
      const user = await createUserInDB({
        email: normalizedEmail,
        passwordHash,
        provider: 'email',
        emailVerified: false,
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await createVerificationTokenInDB({
        userId: user.id,
        email: user.email,
        token: verificationToken,
        expiresAt,
      });

      const origin =
        process.env.APP_URL ||
        process.env.NEXTAUTH_URL ||
        req.nextUrl.origin ||
        'http://localhost:3000';

      const verificationUrl = `${origin}/api/auth/verify-email?token=${verificationToken}`;

      await sendVerificationEmail({
        email: user.email,
        verificationUrl,
      });

      return NextResponse.json(
        {
          message: 'Verification email sent. Please check your inbox.',
          requiresVerification: true,
          email: user.email,
        },
        { status: 201 }
      );
    }

    // Local mode: immediate verification and session issue
    const user = await createUserInDB({
      email: normalizedEmail,
      passwordHash,
      provider: 'email',
      emailVerified: true,
    });

    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      provider: user.provider,
      emailVerified: true,
    };

    const token = createSessionToken(userSession);

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: userSession,
        emailVerified: true,
      },
      { status: 201 }
    );

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
      { error: error.message || 'Internal server error during sign up.' },
      { status: 500 }
    );
  }
}
