import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmailFromDB, createPasswordResetTokenInDB } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { getAppUrl } from '@/lib/auth';

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

    const normalizedEmail = email.trim().toLowerCase();
    const user = await getUserByEmailFromDB(normalizedEmail);

    if (user) {
      // Generate a cryptographically secure random reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await createPasswordResetTokenInDB({
        userId: user.id,
        email: user.email,
        token: resetToken,
        expiresAt,
      });

      const origin = getAppUrl(req);
      const resetUrl = `${origin}/reset-password?token=${resetToken}`;

      await sendPasswordResetEmail({
        email: user.email,
        resetUrl,
      });
    }

    // Always respond with success message to prevent user enumeration
    return NextResponse.json({
      message:
        'If an account exists with this email, a password reset link has been sent to your inbox.',
    });
  } catch (error: any) {
    console.error('Error in forgot-password handler:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
