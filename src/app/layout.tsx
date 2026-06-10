import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rosso di Sera Staff App',
  description: 'Gestione espositori, edizioni e pagamenti Rosso di Sera',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
