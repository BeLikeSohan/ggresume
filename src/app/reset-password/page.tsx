'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { GGLogo } from '@/components/common/GGLogo';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('Password reset token is missing.');
      setIsValidatingToken(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.valid) {
          setTokenError(
            data.error || 'This password reset link has expired or is invalid.'
          );
        } else if (data.email) {
          setUserEmail(data.email);
        }
      } catch {
        // In case of network error, allow form submission to try directly
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing reset token. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      if (data.user) {
        try {
          localStorage.setItem('ggresume_user', JSON.stringify(data.user));
        } catch (_) {}
      }

      setIsSuccess(true);
      setIsSubmitting(false);

      // Auto redirect to dashboard after brief pause
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white relative overflow-hidden">
      {/* Background Accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-slate-200/50 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Top Header */}
      <header className="w-full h-16 px-6 sm:px-10 flex items-center justify-between max-w-6xl mx-auto z-10">
        <Link
          href="/"
          className="flex items-center group transition-transform hover:scale-105"
          aria-label="GGResume Home"
        >
          <GGLogo size="xl" variant="big" showWordmark={false} />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden p-6 sm:p-8 space-y-6">
          {isValidatingToken ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 size={28} className="animate-spin text-slate-900" />
              <p className="text-xs font-medium">Validating reset link...</p>
            </div>
          ) : tokenError ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
                <AlertCircle size={24} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                  Invalid or Expired Link
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  {tokenError}
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href="/?auth=forgot-password"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Request a New Reset Link</span>
                  <ArrowRight size={13} />
                </Link>

                <Link
                  href="/"
                  className="text-xs text-slate-500 hover:text-slate-900 transition underline underline-offset-4 cursor-pointer block mx-auto"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-5 py-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={24} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                  Password Reset Successful
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Your password has been updated. Redirecting you to your dashboard...
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-2 pt-1">
                <div className="flex justify-center">
                  <GGLogo size="md" showWordmark={false} />
                </div>
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                  Set new password
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {userEmail ? (
                    <>
                      Create a strong new password for{' '}
                      <strong className="text-slate-800 font-semibold">{userEmail}</strong>
                    </>
                  ) : (
                    'Please enter and confirm your new password below.'
                  )}
                </p>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    New Password
                  </label>
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
                  <p className="text-[11px] text-slate-400">At least 6 characters</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 text-center text-xs text-slate-400 z-10">
        <p>© {new Date().getFullYear()} GGResume — ATS Resume Builder</p>
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
