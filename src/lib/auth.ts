import crypto from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'ggresume_session';
export const GOOGLE_OAUTH_STATE_COOKIE = 'ggresume_oauth_state';
const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET;
if (!secret) {
  throw new Error(
    'AUTH_SECRET or SESSION_SECRET environment variable is missing. The application requires an authentication secret to start.'
  );
}

export const SESSION_SECRET: string = secret;

export interface UserSession {
  id: string;
  email: string;
  provider: string;
  emailVerified: boolean;
}

/**
 * Validate redirect targets against an allowlist to prevent open-redirect vulnerabilities.
 */
const ALLOWED_REDIRECT_PREFIXES = ['/dashboard', '/editor', '/about-us', '/reset-password'];

export function sanitizeRedirectPath(path: unknown): string {
  if (typeof path !== 'string') return '/dashboard';
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return '/dashboard';
  }
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => trimmed === prefix || trimmed.startsWith(`${prefix}/`) || trimmed.startsWith(`${prefix}?`)
  );
  return isAllowed ? trimmed : '/dashboard';
}

/**
 * Checks if Google OAuth is configured via environment variables.
 */
export function isGoogleAuthEnabled(): boolean {
  return Boolean(
    (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) &&
      process.env.GOOGLE_CLIENT_SECRET
  );
}

/**
 * Get Google OAuth client configuration.
 */
export function getGoogleAuthConfig() {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  return {
    clientId,
    clientSecret,
    enabled: Boolean(clientId && clientSecret),
  };
}

/**
 * Helper to resolve the canonical base URL for the app (handles reverse proxies & headers).
 */
export function getAppUrl(req?: {
  headers?: { get: (name: string) => string | null };
  nextUrl?: { origin?: string };
}): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, '');
  }
  if (req?.headers) {
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const host =
      req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (host) {
      return `${proto}://${host}`;
    }
  }
  if (req?.nextUrl?.origin) {
    return req.nextUrl.origin;
  }
  return 'http://localhost:3000';
}

/**
 * Checks if running in local/docker mode where email verification is bypassed.
 */
export function isLocalAuthMode(): boolean {
  const localMode =
    process.env.AUTH_LOCAL_MODE || process.env.NEXT_PUBLIC_AUTH_LOCAL_MODE;
  if (localMode === 'true' || localMode === '1') return true;
  return false;
}

export function isEmailVerificationRequired(): boolean {
  if (isLocalAuthMode()) return false;
  if (
    process.env.SKIP_EMAIL_VERIFICATION === 'true' ||
    process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === 'true'
  ) {
    return false;
  }
  return true;
}

/**
 * Hash a password using scrypt with a random 16-byte salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a plain text password against a stored salt:hash string
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Helper to encode ArrayBuffer to base64url
 */
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Helper to decode base64url to ArrayBuffer
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
 * Create a signed session payload
 */
export function createSessionToken(user: UserSession): string {
  const data = JSON.stringify({
    ...user,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  const encoded = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

/**
 * Verify and decode a session token (synchronous / Node runtime)
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    );
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      provider: payload.provider || 'email',
      emailVerified: !!payload.emailVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Verify session token using Web Crypto API (Edge Runtime / Middleware compatible)
 */
export async function verifySessionTokenAsync(
  token: string
): Promise<UserSession | null> {
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
      provider: payload.provider || 'email',
      emailVerified: !!payload.emailVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Get current user session from HTTP cookies (server-side)
 */
export async function getServerSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
