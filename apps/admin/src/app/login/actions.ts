'use server';

import { headers } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAllowedAdmin } from '@/lib/auth';

/**
 * Send a magic sign-in link to an allowlisted admin email.
 * Refuses non-allowlisted emails so the portal UI never triggers auth for them.
 * The link redirects back to /auth/callback, which exchanges the code for a session.
 */
export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return { ok: false, error: 'Adresse email requise.' };
  }
  if (!isAllowedAdmin(normalized)) {
    return { ok: false, error: "Cette adresse n'est pas autorisée à accéder au portail." };
  }

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const origin = `${proto}://${host}`;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
