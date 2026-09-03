import type { Metadata, Viewport } from 'next';
import {
  Inter,
  Source_Sans_3,
  Roboto,
  Open_Sans,
  Lato,
  Plus_Jakarta_Sans,
  Literata,
  Merriweather,
  Lora,
  EB_Garamond,
} from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-literata',
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-eb-garamond',
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
    <html
      lang="en"
      className={`${inter.variable} ${sourceSans.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${plusJakartaSans.variable} ${literata.variable} ${merriweather.variable} ${lora.variable} ${ebGaramond.variable}`}
    >
      <body className="bg-slate-100 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
