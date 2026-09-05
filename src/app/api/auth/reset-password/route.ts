import { NextRequest, NextResponse } from 'next/server';
import {
  getPasswordResetTokenFromDB,
  deletePasswordResetTokenFromDB,
  updateUserPasswordInDB,
  getUserByIdFromDB,
} from '@/lib/db';
import {
  hashPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  UserSession,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'Reset token is required.' },
      { status: 400 }
    );
  }

  try {
    const record = await getPasswordResetTokenFromDB(token);
    if (!record || record.isExpired || new Date() > new Date(record.expiresAt)) {
      return NextResponse.json(
        { valid: false, error: 'Reset link has expired or is invalid.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: record.email,
    });
  } catch (err: any) {
    console.error('Error validating reset token:', err);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate reset token.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is missing or invalid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const record = await getPasswordResetTokenFromDB(token);
    if (!record) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has already been used.' },
        { status: 400 }
      );
    }

    if (record.isExpired || new Date() > new Date(record.expiresAt)) {
      await deletePasswordResetTokenFromDB(token);
      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = hashPassword(password);

    // Update password in database and mark verified
    await updateUserPasswordInDB(record.userId, passwordHash);

    // Invalidate reset token
    await deletePasswordResetTokenFromDB(token);

    // Retrieve user profile
    const user = await getUserByIdFromDB(record.userId);

    const userSession: UserSession = {
      id: record.userId,
      email: user ? user.email : record.email,
      provider: user ? user.provider : 'email',
      emailVerified: true,
    };

    const sessionToken = createSessionToken(userSession);

    const response = NextResponse.json({
      message: 'Password updated successfully.',
      user: userSession,
    });

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
  } catch (error: any) {
    console.error('Error during password reset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
