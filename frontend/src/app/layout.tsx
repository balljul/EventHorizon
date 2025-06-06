import type { Metadata } from 'next';
import '../styles/globals.css';
import ClientProviders from './providers';

export const metadata: Metadata = {
  title: 'EventHorizon',
  description: 'A modern event management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}