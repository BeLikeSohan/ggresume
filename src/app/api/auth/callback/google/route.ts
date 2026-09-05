import { NextRequest, NextResponse } from 'next/server';
import {
  getGoogleAuthConfig,
  getAppUrl,
  GOOGLE_OAUTH_STATE_COOKIE,
  SESSION_COOKIE_NAME,
  createSessionToken,
  UserSession,
} from '@/lib/auth';
import { upsertGoogleUserInDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const origin = getAppUrl(req);
  const searchParams = req.nextUrl.searchParams;

  const error = searchParams.get('error');
  if (error) {
    console.warn('Google OAuth returned error:', error);
    return NextResponse.redirect(`${origin}/?auth=signin&error=google_access_denied`);
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth=signin&error=google_no_code`);
  }

  // Validate state to prevent CSRF attacks
  const storedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  let nextPath = '/dashboard';

  if (state) {
    try {
      const decoded = JSON.parse(
        Buffer.from(state, 'base64url').toString('utf-8')
      );
      if (decoded.next && typeof decoded.next === 'string' && decoded.next.startsWith('/')) {
        nextPath = decoded.next;
      }
    } catch (_) {
      // Keep default dashboard path
    }
  }

  if (storedState && state && storedState !== state) {
    console.warn('Google OAuth state mismatch');
    return NextResponse.redirect(`${origin}/?auth=signin&error=google_state_mismatch`);
  }

  const { clientId, clientSecret, enabled } = getGoogleAuthConfig();
  if (!enabled || !clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/?auth=signin&error=google_not_configured`);
  }

  const redirectUri = `${origin}/api/auth/callback/google`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Google token exchange error:', errText);
      return NextResponse.redirect(
        `${origin}/?auth=signin&error=google_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    let email: string | null = null;

    // Fetch user info using the access token
    if (accessToken) {
      const userRes = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (userRes.ok) {
        const userData = await userRes.json();
        email = userData.email || null;
      }
    }

    // Fallback to tokeninfo with ID token if userinfo failed
    if (!email && idToken) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        email = verifyData.email || null;
      }
    }

    if (!email) {
      return NextResponse.redirect(
        `${origin}/?auth=signin&error=google_no_email`
      );
    }

    // Upsert user in database
    const user = await upsertGoogleUserInDB({ email });

    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      provider: user.provider || 'google',
      emailVerified: true,
    };

    const sessionToken = createSessionToken(userSession);

    // Build redirect target URL
    const targetUrl = new URL(nextPath, origin);

    const response = NextResponse.redirect(targetUrl.toString());

    // Set persistent session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear state cookie
    response.cookies.set({
      name: GOOGLE_OAUTH_STATE_COOKIE,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error('Exception during Google OAuth callback:', err);
    return NextResponse.redirect(
      `${origin}/?auth=signin&error=google_callback_failed`
    );
  }
}
