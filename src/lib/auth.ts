import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'ggresume_session';
const SESSION_SECRET = process.env.AUTH_SECRET || process.env.SESSION_SECRET || 'ggresume-secret-session-key-fallback-32chars';

export interface UserSession {
  id: string;
  email: string;
  provider: string;
  emailVerified: boolean;
}

/**
 * Checks if running in local/docker mode where email verification is bypassed
 * and Google OAuth is disabled.
 */
export function isLocalAuthMode(): boolean {
  const localMode = process.env.AUTH_LOCAL_MODE || process.env.NEXT_PUBLIC_AUTH_LOCAL_MODE;
  if (localMode === 'true' || localMode === '1') return true;
  return false;
}

export function isGoogleAuthEnabled(): boolean {
  if (isLocalAuthMode()) return false;
  if (process.env.DISABLE_GOOGLE_AUTH === 'true' || process.env.NEXT_PUBLIC_DISABLE_GOOGLE_AUTH === 'true') {
    return false;
  }
  return true;
}

export function isEmailVerificationRequired(): boolean {
  if (isLocalAuthMode()) return false;
  if (process.env.SKIP_EMAIL_VERIFICATION === 'true' || process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === 'true') {
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
 * Verify and decode a session token
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
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

export { SESSION_COOKIE_NAME };
