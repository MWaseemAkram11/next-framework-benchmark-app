import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Framework Benchmark App',
  description: 'Next.js performance benchmark application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://admin.box.co.uk" />
        <link rel="preconnect" href="https://media.box.co.uk" />
        <link rel="dns-prefetch" href="https://admin.box.co.uk" />
        <link rel="dns-prefetch" href="https://media.box.co.uk" />
      </head>
      <body suppressHydrationWarning={true}>
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}