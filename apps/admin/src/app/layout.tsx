import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bug Reporter \u2014 Admin',
  description: 'Admin dashboard for Bug Reporter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-lg font-bold text-indigo-600">Bug Reporter</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
