import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Feature Board — Bug Reporter',
  description: 'Vote and submit feature requests',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
