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

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<AuthConfig>({
    localAuthMode: true,
    showGoogleAuth: false,
    requireEmailVerification: false,
  });

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/config', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch {
      // Fallback
    }
  }, []);

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
    loadConfig();
    loadSession();
  }, [loadConfig, loadSession]);

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
