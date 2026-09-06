import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, Globe, User } from 'lucide-react';
import { GGLogo } from '@/components/common/GGLogo';
import { HalfGlobe } from '@/components/landing/HalfGlobe';
import { GithubIcon } from '@/components/preview/Icons';

export const metadata: Metadata = {
  title: 'About — GGResume',
  description: 'GGResume is a free, open-source ATS resume builder created by Washiul Islam.',
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-slate-200/50 via-slate-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Animated Half Globe in Background */}
      <HalfGlobe />

      {/* Minimal Top Nav */}
      <header className="w-full h-16 px-6 sm:px-10 flex items-center justify-between max-w-6xl mx-auto z-10 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center group transition-transform hover:scale-105"
          aria-label="GGResume Home"
        >
          <GGLogo size="xl" variant="big" showWordmark={false} />
        </Link>

        <Link
          href="/"
          className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={15} />
          <span>Home</span>
        </Link>
      </header>

      {/* Full-Screen Centered Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 max-w-3xl mx-auto z-10 space-y-10 w-full">
        {/* Aesthetic Center Logo */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <Image
              src="/ggresume-logo-small.png"
              alt="GGResume Logo"
              width={80}
              height={80}
              priority
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950">
              <span>Built in the </span>
              <span className="text-slate-700 font-bold">open.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto font-normal leading-relaxed">
              GGResume is a free, open-source ATS-friendly resume builder designed for engineers and professionals to create high-impact resumes.
            </p>
          </div>
        </div>

        {/* Minimalist Link Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl">
          {/* GitHub Repo */}
          <a
            href="https://github.com/BeLikeSohan/ggresume"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-start justify-between p-4 rounded-xl bg-white/75 hover:bg-white border border-slate-200/80 hover:border-slate-300/90 shadow-none hover:shadow-xs transition-all duration-150 text-left"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors duration-150">
                <GithubIcon size={16} />
              </div>
              <ArrowUpRight size={15} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Source Code
              </span>
              <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">
                github.com/BeLikeSohan/ggresume
              </span>
            </div>
          </a>

          {/* Dev Website */}
          <a
            href="https://washiul.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-start justify-between p-4 rounded-xl bg-white/75 hover:bg-white border border-slate-200/80 hover:border-slate-300/90 shadow-none hover:shadow-xs transition-all duration-150 text-left"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-150">
                <Globe size={16} />
              </div>
              <ArrowUpRight size={15} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Developer Site
              </span>
              <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">
                washiul.com
              </span>
            </div>
          </a>

          {/* GitHub Profile */}
          <a
            href="https://github.com/BeLikeSohan"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-start justify-between p-4 rounded-xl bg-white/75 hover:bg-white border border-slate-200/80 hover:border-slate-300/90 shadow-none hover:shadow-xs transition-all duration-150 text-left"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors duration-150">
                <User size={16} />
              </div>
              <ArrowUpRight size={15} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Creator Profile
              </span>
              <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">
                @BeLikeSohan
              </span>
            </div>
          </a>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full px-6 py-6 text-center text-xs text-slate-400 z-10">
        <p>© {new Date().getFullYear()} GGResume — ATS Resume Builder</p>
      </footer>
    </div>
  );
}
