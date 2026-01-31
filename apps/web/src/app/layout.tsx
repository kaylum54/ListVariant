import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';
import type { Metadata } from 'next';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Tom Flips — Cross-List Furniture to eBay, Facebook & Gumtree in One Click',
    template: '%s | Tom Flips',
  },
  description:
    'Stop manually listing furniture on every marketplace. Tom Flips lets UK resellers cross-list to eBay, Facebook Marketplace, and Gumtree in seconds. Free plan available.',
  keywords: [
    'furniture reselling',
    'cross-listing tool',
    'eBay listing tool',
    'Facebook Marketplace',
    'Gumtree',
    'furniture flipping UK',
    'reseller tools',
    'multi-platform listing',
    'furniture cross-list',
  ],
  authors: [{ name: 'Tom Flips' }],
  creator: 'Tom Flips',
  metadataBase: new URL('https://tomflips.co.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://tomflips.co.uk',
    siteName: 'Tom Flips',
    title: 'Tom Flips — Cross-List Furniture to eBay, Facebook & Gumtree in One Click',
    description:
      'Stop manually listing furniture on every marketplace. Tom Flips lets UK resellers cross-list to eBay, Facebook Marketplace, and Gumtree in seconds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tom Flips — List once, sell everywhere. Cross-listing platform for UK furniture resellers.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tom Flips — Cross-List Furniture to eBay, Facebook & Gumtree',
    description:
      'Stop manually listing furniture on every marketplace. Cross-list to eBay, Facebook Marketplace, and Gumtree in seconds.',
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
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={plusJakarta.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
