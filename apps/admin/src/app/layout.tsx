import type { Metadata } from 'next';
import './globals.css';
import { createServerSupabase } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/LogoutButton';

export const metadata: Metadata = {
  title: 'Bug Reporter \u2014 Admin',
  description: 'Admin dashboard for Bug Reporter',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-8">
              <h1 className="text-lg font-bold text-indigo-600">Bug Reporter</h1>
              {user && (
                <nav className="flex items-center gap-4">
                  <a href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Bugs</a>
                  <a href="/features" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Features</a>
                </nav>
              )}
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-gray-500 sm:inline">{user.email}</span>
                <LogoutButton />
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
