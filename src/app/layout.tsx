import type { Metadata, Viewport } from 'next';
import { Inter, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GGResume — Modern ATS Resume Builder & Manager',
  description:
    'Free, open-source high performance ATS-friendly resume builder and manager designed for software engineers and professionals.',
  keywords: [
    'GGResume',
    'resume builder',
    'ATS resume',
    'software engineer resume',
    'developer CV',
    'PDF resume export',
  ],
  authors: [{ name: 'GGResume' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSans.variable}`}>
      <body className="bg-slate-100 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
