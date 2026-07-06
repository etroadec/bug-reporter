'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { isAllowedAdmin } from '@/lib/auth';

/**
 * Send a one-time login code to an allowlisted admin email.
 * Refuses non-allowlisted emails so the portal UI never triggers OTP for them.
 */
export async function sendOtp(email: string): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return { ok: false, error: 'Adresse email requise.' };
  }
  if (!isAllowedAdmin(normalized)) {
    return { ok: false, error: "Cette adresse n'est pas autorisée à accéder au portail." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: { shouldCreateUser: true },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
