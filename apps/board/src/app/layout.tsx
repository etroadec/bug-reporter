import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suggestions — Bug Reporter',
  description: 'Votez et proposez des fonctionnalites',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-white text-gray-900 antialiased">
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
