'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, LayoutDashboard, LogOut } from 'lucide-react';
import { GGLogo } from '@/components/common/GGLogo';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/hooks/useAuth';

export const LandingPage: React.FC = () => {
  const { user, signOut, isLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const openAuth = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-slate-200/50 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Minimal Top Nav */}
      <header className="w-full h-16 px-6 sm:px-10 flex items-center justify-between max-w-6xl mx-auto z-10 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center group transition-transform hover:scale-105"
          aria-label="GGResume Home"
        >
          <GGLogo size="xl" variant="big" showWordmark={false} />
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-slate-700 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition inline-flex items-center gap-1.5"
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="text-xs sm:text-sm font-medium text-slate-500 hover:text-red-600 px-2 py-1.5 rounded-lg transition"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth('signin')}
                className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-lg transition"
              >
                Sign In
              </button>
              <Link
                href="/about-us"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 transition inline-flex items-center gap-1.5"
              >
                <span>About Us</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Centered Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 max-w-3xl mx-auto z-10 space-y-8">
        {/* Aesthetic Center Logo (Small Logo) */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <Image
              src="/ggresume-logo-small.png"
              alt="GGResume Logo"
              width={96}
              height={96}
              priority
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>

          {/* Centered Title */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950">
              <span>GG</span>
              <span className="text-slate-700 font-bold">Resume</span>
            </h1>
          </div>
        </div>

        {/* Minimalist Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto font-normal leading-relaxed">
          Craft ATS-optimized resumes with pixel-perfect typography, custom sections, and instant vector PDF export.
        </p>

        {/* CTA Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base transition-all duration-150 shadow-md hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuth('signup')}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base transition-all duration-150 shadow-md hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full px-6 py-6 text-center text-xs text-slate-400 z-10">
        <p>© {new Date().getFullYear()} GGResume — ATS Resume Builder</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
