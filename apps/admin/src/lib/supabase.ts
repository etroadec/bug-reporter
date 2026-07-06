import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SCREENSHOTS_BUCKET = 'screenshots';

export type BugReport = {
  id: string;
  screenshot_url: string | null;
  description: string;
  category: string;
  severity: string | null;
  status: string;
  device_brand: string | null;
  device_model: string | null;
  device_os: string | null;
  device_os_version: string | null;
  app_name: string | null;
  app_version: string | null;
  app_build: string | null;
  network_type: string | null;
  network_connected: boolean | null;
  current_screen: string | null;
  timezone: string | null;
  custom_data: Record<string, unknown> | null;
  project_id: string;
  reported_by: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BugComment = {
  id: string;
  bug_id: string;
  author: string | null;
  content: string;
  created_at: string;
};

export type FeatureRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  vote_count: number;
  project_id: string;
  submitted_by: string | null;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
};

// Server-side client using service_role key — bypasses RLS
// Safe because it only runs in server components / API routes (never sent to browser)
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Client-side client using anon key — subject to RLS
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Extract the storage object path from a stored screenshot reference.
 * Accepts both a bare object path (new format) and a legacy public URL
 * of the form `.../object/public/screenshots/<path>` (old format).
 */
export function screenshotObjectPath(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const marker = `/${SCREENSHOTS_BUCKET}/`;
  const idx = stored.indexOf(marker);
  const path = (idx !== -1 ? stored.slice(idx + marker.length) : stored)
    .replace(/^\/+/, '')
    .split('?')[0];
  return path || null;
}

/**
 * Create a short-lived signed URL for a stored screenshot. The bucket is
 * private, so display must go through a signed URL rather than a public URL.
 * Returns null when there is no screenshot or the object cannot be signed.
 */
export async function signScreenshotUrl(
  supabase: SupabaseClient,
  stored: string | null | undefined,
  expiresIn = 60 * 60
): Promise<string | null> {
  const path = screenshotObjectPath(stored);
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(SCREENSHOTS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
