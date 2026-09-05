'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { GGLogo } from '@/components/common/GGLogo';
import { GoogleIcon } from '@/components/preview/Icons';
import { AUTH_CONFIG } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot-password';
}

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    'Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
  google_access_denied: 'Google sign-in was cancelled.',
  google_exchange_failed: 'Failed to verify Google login. Please try again.',
  google_userinfo_failed: 'Unable to retrieve your Google profile. Please try again.',
  google_state_mismatch: 'Google sign-in security verification failed. Please try again.',
  google_no_code: 'Google sign-in timed out or was cancelled.',
  google_no_email: 'No verified email found with this Google account.',
  google_callback_failed: 'An unexpected error occurred during Google sign-in.',
  missing_token: 'Verification link is missing or invalid.',
  invalid_or_expired_token: 'Verification link has expired or is invalid.',
  token_expired: 'Verification link has expired. Please request a new one.',
  verification_failed: 'Failed to verify email. Please try again.',
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification pending state
  const [verificationPending, setVerificationPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Forgot password state
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setVerificationPending(false);
    setResendMessage(null);
    setForgotSent(false);
    setForgotMessage(null);
    setIsGoogleLoading(false);

    // Check for errors in URL params
    const errCode = searchParams.get('error');
    if (errCode) {
      setError(ERROR_MESSAGES[errCode] || decodeURIComponent(errCode));
    } else {
      setError(null);
    }
  }, [initialMode, isOpen, searchParams]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setError(null);
    setIsGoogleLoading(true);
    // Redirect to the backend OAuth initiation endpoint
    window.location.href = '/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot-password') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || 'Failed to send reset email.');
        }

        setIsLoading(false);
        setForgotSent(true);
        setForgotMessage(
          data.message ||
            'If an account exists with this email, a reset link has been sent.'
        );
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'An error occurred. Please try again.');
      }
      return;
    }

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
      const body = { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      // Check if sign-in or sign-up requires email verification
      if (data.requiresVerification) {
        setIsLoading(false);
        setUnverifiedEmail(data.email || email.trim());
        setVerificationPending(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      if (data.user) {
        try {
          localStorage.setItem('ggresume_user', JSON.stringify(data.user));
        } catch (_) {}
      }

      setIsLoading(false);
      onClose();
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    setResendMessage(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json().catch(() => ({}));
      setIsResending(false);
      setResendMessage(data.message || 'Verification email resent successfully.');
    } catch {
      setIsResending(false);
      setResendMessage('Failed to resend email. Please try again later.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Verification Pending View */}
          {verificationPending ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-900">
                <Mail size={24} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                  Verify your email
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Your email address (<strong className="text-slate-900 font-semibold">{unverifiedEmail}</strong>) is not verified yet. Please check your inbox or request a new verification link below.
                </p>
              </div>

              {resendMessage && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                  {resendMessage}
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {isResending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  <span>Resend Verification Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationPending(false);
                    setResendMessage(null);
                    setMode('signin');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 transition underline underline-offset-4 cursor-pointer block mx-auto"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : mode === 'forgot-password' ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="text-center space-y-2 pt-1">
                <div className="flex justify-center">
                  <GGLogo size="md" showWordmark={false} />
                </div>
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                  Reset your password
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Enter the email address associated with your account, and we&apos;ll send you a password reset link.
                </p>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {forgotSent ? (
                <div className="space-y-4 py-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium leading-relaxed flex items-start gap-2.5">
                    <Mail size={16} className="text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>{forgotMessage}</span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(false);
                        setError(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Resend or use another email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                        setForgotSent(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-900 transition underline underline-offset-4 cursor-pointer block mx-auto"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-900 transition underline underline-offset-4 cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-2 pt-1">
                <div className="flex justify-center">
                  <GGLogo size="md" showWordmark={false} />
                </div>
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {mode === 'signin'
                    ? 'Sign in to access your saved resumes and vector PDF exports.'
                    : 'Get started with fast, ATS-optimized resume building.'}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* Google Sign In Button */}
              {AUTH_CONFIG.showGoogleAuth && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold text-xs sm:text-sm transition-all shadow-xs hover:shadow flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-slate-500" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon size={17} />
                        <span>
                          {mode === 'signin'
                            ? 'Continue with Google'
                            : 'Sign up with Google'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      or
                    </span>
                    <div className="border-t border-slate-200 w-full" />
                  </div>
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot-password');
                          setError(null);
                          setForgotSent(false);
                        }}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition underline underline-offset-2 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-[11px] text-slate-400">At least 6 characters</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In with Email' : 'Create Account'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
