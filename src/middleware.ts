import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'ggresume_session';
const SESSION_SECRET =
  process.env.AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  'ggresume-secret-session-key-fallback-32chars';

/**
 * Base64URL to ArrayBuffer decoder compatible with Edge Runtime
 */
function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLength);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Edge-compatible session verifier using Web Crypto API
 */
async function verifySessionTokenEdge(
  token: string
): Promise<{ id: string; email: string; emailVerified: boolean } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;

    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = base64UrlToBuffer(signature);
    const valid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(encoded)
    );

    if (!valid) return null;

    const decodedString = new TextDecoder().decode(base64UrlToBuffer(encoded));
    const payload = JSON.parse(decodedString);

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      emailVerified: !!payload.emailVerified,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie
    ? await verifySessionTokenEdge(sessionCookie)
    : null;

  // 1. If user is authenticated and visits the landing page ("/"), auto redirect to "/dashboard"
  if (pathname === '/') {
    if (session) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 2. Protected paths check
  const isProtectedPage =
    pathname.startsWith('/dashboard') || pathname.startsWith('/editor');
  const isProtectedApi =
    pathname.startsWith('/api/resumes') ||
    pathname.startsWith('/api/export-pdf');

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // 3. Unauthenticated access to protected routes
  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    // Redirect unauthenticated user to home page with signin trigger
    const loginUrl = new URL('/', req.url);
    loginUrl.searchParams.set('auth', 'signin');
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Inject user info into headers for downstream handlers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', session.id);
  requestHeaders.set('x-user-email', session.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/editor/:path*',
    '/api/resumes/:path*',
    '/api/export-pdf/:path*',
  ],
};
