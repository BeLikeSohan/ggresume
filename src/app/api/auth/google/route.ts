import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getGoogleAuthConfig,
  getAppUrl,
  GOOGLE_OAUTH_STATE_COOKIE,
  SESSION_COOKIE_NAME,
  createSessionToken,
  sanitizeRedirectPath,
  UserSession,
} from '@/lib/auth';
import { upsertGoogleUserInDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/google
 * Initiates the Google OAuth 2.0 Authorization Code flow.
 */
export async function GET(req: NextRequest) {
  const origin = getAppUrl(req);
  const { clientId, enabled } = getGoogleAuthConfig();

  if (!enabled || !clientId) {
    return NextResponse.redirect(`${origin}/?auth=signin&error=google_not_configured`);
  }

  const nextUrl = sanitizeRedirectPath(req.nextUrl.searchParams.get('next'));
  const stateToken = crypto.randomBytes(24).toString('hex');
  const stateData = JSON.stringify({ token: stateToken, next: nextUrl });
  const encodedState = Buffer.from(stateData).toString('base64url');

  const redirectUri = `${origin}/api/auth/callback/google`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', encodedState);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(googleAuthUrl.toString());

  // Set transient state cookie for CSRF validation (10 minutes lifetime)
  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: encodedState,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}

/**
 * POST /api/auth/google
 * Handles direct ID token / credential verification (e.g., Google One Tap or Google SDK).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body.idToken || body.credential;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Missing Google ID token or credential.' },
        { status: 400 }
      );
    }

    const { clientId } = getGoogleAuthConfig();

    // Verify token directly with Google's tokeninfo API
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: 'Invalid Google credential or token.' },
        { status: 401 }
      );
    }

    const payload = await verifyRes.json();

    if (!payload.email) {
      return NextResponse.json(
        { error: 'No email address associated with this Google account.' },
        { status: 400 }
      );
    }

    // Optional audience verification if clientId is set
    if (clientId && payload.aud && payload.aud !== clientId) {
      return NextResponse.json(
        { error: 'Google client ID mismatch.' },
        { status: 401 }
      );
    }

    const user = await upsertGoogleUserInDB({ email: payload.email });

    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      provider: user.provider || 'google',
      emailVerified: true,
    };

    const sessionToken = createSessionToken(userSession);

    const response = NextResponse.json({
      message: 'Signed in with Google successfully',
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
    console.error('Error during Google authentication POST:', error);
    return NextResponse.json(
      { error: error?.message || 'Google authentication failed.' },
      { status: 500 }
    );
  }
}
