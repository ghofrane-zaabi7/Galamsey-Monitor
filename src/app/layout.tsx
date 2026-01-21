import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Galamsey Monitor - Fighting Illegal Mining in Ghana',
  description: 'Comprehensive platform for monitoring, reporting, and combating illegal small-scale mining (galamsey) in Ghana. Track incidents, water quality, and affected areas.',
  keywords: ['galamsey', 'illegal mining', 'Ghana', 'environment', 'water pollution', 'monitoring'],
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
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
