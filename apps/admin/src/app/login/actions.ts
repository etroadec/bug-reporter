'use server';

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

  // Trusted, server-configured base URL. NEVER derive the redirect origin from
  // request headers (Host / X-Forwarded-Host are client-controllable and would
  // allow redirecting a valid magic link to an attacker's domain).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (!siteUrl) {
    return { ok: false, error: 'Configuration manquante côté serveur (NEXT_PUBLIC_SITE_URL).' };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
