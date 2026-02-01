import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'SyncSellr — Cross-List to 7 UK Marketplaces in One Click',
    template: '%s | SyncSellr',
  },
  description:
    'List once, sell everywhere. SyncSellr lets UK resellers cross-list to eBay, Facebook, Gumtree, Etsy, Vinted, Depop, and Poshmark from one dashboard.',
  keywords: [
    'cross-listing tool UK',
    'multi-marketplace listing',
    'sell on multiple marketplaces',
    'eBay cross-listing',
    'Gumtree listing tool',
    'UK reseller software',
    'Vinted cross-list',
    'Depop listing tool',
    'marketplace automation UK',
    'cross-listing platform',
  ],
  authors: [{ name: 'SyncSellr' }],
  creator: 'SyncSellr',
  metadataBase: new URL('https://syncsellr.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://syncsellr.com',
    siteName: 'SyncSellr',
    title: 'SyncSellr — Cross-List to 7 UK Marketplaces Instantly',
    description:
      'Stop copy-pasting listings. SyncSellr publishes your items to eBay, Facebook, Gumtree, Etsy, Vinted, Depop, and Poshmark with one click.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SyncSellr — List once, sell everywhere. Cross-listing platform for UK resellers.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SyncSellr — Cross-List to 7 UK Marketplaces Instantly',
    description:
      'Stop copy-pasting listings. SyncSellr publishes your items to eBay, Facebook, Gumtree, Etsy, Vinted, Depop, and Poshmark with one click.',
    images: ['/og-image.png'],
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
