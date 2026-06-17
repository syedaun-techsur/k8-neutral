import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickNotes',
  description: 'A fast, mobile-first notes app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
