'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  provider?: string;
  emailVerified?: boolean;
}

export interface AuthConfig {
  localAuthMode: boolean;
  showGoogleAuth: boolean;
  requireEmailVerification: boolean;
}

// Build-time evaluated auth configuration via NEXT_PUBLIC_* environment variables
export const AUTH_CONFIG: AuthConfig = {
  localAuthMode:
    process.env.NEXT_PUBLIC_AUTH_LOCAL_MODE === 'true' ||
    process.env.NEXT_PUBLIC_AUTH_LOCAL_MODE === '1',
  showGoogleAuth:
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === '1' ||
    (Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) &&
      process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== 'false' &&
      process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== '0'),
  requireEmailVerification:
    process.env.NEXT_PUBLIC_AUTH_LOCAL_MODE !== 'true' &&
    process.env.NEXT_PUBLIC_AUTH_LOCAL_MODE !== '1' &&
    process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION !== 'true' &&
    process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION !== '1' &&
    process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION !== 'false' &&
    process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION !== '0',
};

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const config = AUTH_CONFIG;

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try cookie-based session first
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem('ggresume_user', JSON.stringify(data.user));
          } catch (_) {}
          setIsLoading(false);
          return;
        }
      }

      // Check localStorage fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('ggresume_user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (_) {}
    try {
      localStorage.removeItem('ggresume_user');
    } catch (_) {}
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.push('/');
    }
  }, [router]);

  return {
    user,
    setUser,
    isLoading,
    config,
    signOut,
    reloadSession: loadSession,
  };
}
