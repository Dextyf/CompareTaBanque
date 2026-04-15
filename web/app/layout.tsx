import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionGuard } from './session-guard';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const BASE_URL = 'https://compare-ta-banque.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'CompareTaBanque — Comparez les banques UEMOA | Côte d\'Ivoire',
    template: '%s | CompareTaBanque',
  },
  description:
    'Comparez gratuitement les offres bancaires de BNI, NSIA, SIB, SGBCI, Coris Bank, BICICI, BDU et Bridge Bank. ' +
    'Notre IA analyse votre profil et identifie la meilleure banque en Côte d\'Ivoire — Zone UEMOA 2026.',
  keywords: [
    'comparateur banque Côte d\'Ivoire',
    'meilleure banque UEMOA',
    'comparatif bancaire Abidjan',
    'BNI NSIA SIB SGBCI Coris',
    'compte bancaire Côte d\'Ivoire',
    'crédit immobilier Abidjan',
    'frais bancaires UEMOA',
    'scoring bancaire IA',
    'comparetabanque',
    'banque Côte d\'Ivoire 2026',
  ],
  authors: [{ name: 'CompareTaBanque — EL-KEYON BUILDER SARL' }],
  creator: 'EL-KEYON BUILDER SARL',
  publisher: 'CompareTaBanque',

  /* ── Open Graph (Facebook, WhatsApp, LinkedIn) ── */
  openGraph: {
    type: 'website',
    locale: 'fr_CI',
    url: BASE_URL,
    siteName: 'CompareTaBanque',
    title: 'CompareTaBanque — Trouvez votre banque idéale en UEMOA',
    description:
      'Comparez gratuitement BNI, NSIA, SIB, SGBCI, Coris, BICICI, BDU, Bridge Bank. ' +
      'IA scoring · Côte d\'Ivoire · Zone UEMOA 2026.',
    images: [
      {
        url: '/logos/logo-compare-ta-banque.png',
        width: 1200,
        height: 630,
        alt: 'CompareTaBanque — Comparateur de banques UEMOA',
      },
    ],
  },

  /* ── Twitter/X card ── */
  twitter: {
    card: 'summary_large_image',
    title: 'CompareTaBanque — Comparez les banques UEMOA',
    description: 'Trouvez la meilleure banque en Côte d\'Ivoire grâce à notre IA. Gratuit · BCEAO · UEMOA.',
    images: ['/logos/logo-compare-ta-banque.png'],
  },

  /* ── Robots & indexation ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  /* ── Icônes ── */
  manifest: '/manifest.json',
  icons: {
    icon: '/logos/logo-compare-ta-banque.png',
    apple: '/logos/logo-compare-ta-banque.png',
  },

  /* ── URL canonique ── */
  alternates: {
    canonical: BASE_URL,
    languages: { 'fr-CI': BASE_URL },
  },
};

export const viewport: Viewport = {
  themeColor: '#005596',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'CompareTaBanque',
  url: 'https://compare-ta-banque.vercel.app',
  logo: 'https://compare-ta-banque.vercel.app/logos/logo-compare-ta-banque.png',
  description:
    'Plateforme de comparaison bancaire indépendante pour la zone UEMOA. ' +
    'Comparez BNI, NSIA, SIB, SGBCI, Coris Bank, BICICI, BDU et Bridge Bank.',
  areaServed: ['Côte d\'Ivoire', 'Zone UEMOA'],
  serviceType: 'Comparateur de banques',
  provider: {
    '@type': 'Organization',
    name: 'EL-KEYON BUILDER SARL',
    url: 'https://compare-ta-banque.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SessionGuard />
        {children}
      </body>
    </html>
  );
}
