import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmailFromDB, createVerificationTokenInDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { isEmailVerificationRequired } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!isEmailVerificationRequired()) {
      return NextResponse.json({
        message: 'Email verification is not enabled in local development mode.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await getUserByEmailFromDB(normalizedEmail);

    if (user && !user.email_verified) {
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
    }

    return NextResponse.json({
      message: 'If the email is registered and unverified, a verification link has been sent.',
    });
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification email.' },
      { status: 500 }
    );
  }
}
