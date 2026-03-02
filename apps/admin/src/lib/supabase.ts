import { createClient } from '@supabase/supabase-js';

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

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
