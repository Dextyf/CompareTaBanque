import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionGuard } from './session-guard';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CompareTaBanque — Trouvez votre banque idéale en UEMOA',
  description:
    'Comparez les offres bancaires de BNI, NSIA, SIB, SGBCI, Coris et plus encore. ' +
    'Trouvez la meilleure banque pour votre profil en Côte d\'Ivoire et dans la zone UEMOA.',
  keywords: ['banque', 'comparateur', 'UEMOA', 'Côte d\'Ivoire', 'crédit', 'compte bancaire'],
  authors: [{ name: 'CompareTaBanque' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/logos/logo-compare-ta-banque.png',
    apple: '/logos/logo-compare-ta-banque.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#005596',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SessionGuard />
        {children}
      </body>
    </html>
  );
}
