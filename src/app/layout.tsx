import type { Metadata } from 'next';
import './globals.css';
import { FestProvider } from '@/context/FestContext';

export const metadata: Metadata = {
  title: 'FestOS | Aarohan 2026 — IIM Indore Festival Control Portal',
  description: 'Internal Festival Control Portal for IIM Indore Aarohan 2026. Real-time accommodation allocation, clash detection, vendor compliance & luxury operations control.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏛️</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#FAF8F5] text-[#1A1A1A] antialiased min-h-screen" suppressHydrationWarning>
        <FestProvider>
          {children}
        </FestProvider>
      </body>
    </html>
  );
}
