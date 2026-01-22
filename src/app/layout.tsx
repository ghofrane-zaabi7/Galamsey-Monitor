import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Galamsey Monitor - Fighting Illegal Mining in Ghana',
  description: 'Comprehensive platform for monitoring, reporting, and combating illegal small-scale mining (galamsey) in Ghana. Track incidents, water quality, and affected areas.',
  keywords: ['galamsey', 'illegal mining', 'Ghana', 'environment', 'water pollution', 'monitoring'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Galamsey Monitor',
  },
  openGraph: {
    title: 'Galamsey Monitor',
    description: 'Protecting Ghana\'s environment by monitoring and reporting illegal mining activities.',
    type: 'website',
    locale: 'en_GH',
    siteName: 'Galamsey Monitor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galamsey Monitor',
    description: 'Protecting Ghana\'s environment by monitoring and reporting illegal mining activities.',
  },
};

export const viewport: Viewport = {
  themeColor: '#006B3F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          {children}
        </Providers>
      </body>
    </html>
  );
}
