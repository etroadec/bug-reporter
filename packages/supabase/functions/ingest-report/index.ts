// Bug Reporter — validated ingestion gateway (REFERENCE IMPLEMENTATION)
//
// Status: NOT deployed / NOT yet wired. This is the recommended migration target
// for anonymous, multi-tenant ingestion. Today the SDK writes to Supabase directly
// with the embedded anon key, which means any holder of that key can insert
// arbitrary reports for any project_id. Routing writes through this Edge Function
// lets us: validate the project, cap payload size, drop unknown fields, and (once
// a store is added) rate-limit — without ever exposing a table-write grant.
//
// Deploy (when adopted):
//   supabase functions deploy ingest-report --no-verify-jwt
// Required function env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-provided by the platform)
//   INGEST_ALLOWED_PROJECTS = comma-separated project_id allowlist
// SDK change required: POST the report JSON here instead of calling supabase-js.
// Screenshots keep going to Storage (separate signed/anon upload); only the
// metadata row flows through this function.
//
// NOTE: the bug_reports BEFORE INSERT trigger still pseudonymizes reported_by,
// so this path inherits the same PII protection as the direct path.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_PROJECTS = (Deno.env.get('INGEST_ALLOWED_PROJECTS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Fields a client is allowed to set. project_id/description handled explicitly.
const ALLOWED_FIELDS = [
  'description', 'category', 'severity', 'screenshot_url',
  'device_brand', 'device_model', 'device_os', 'device_os_version',
  'app_name', 'app_version', 'app_build', 'network_type', 'network_connected',
  'current_screen', 'timezone', 'custom_data', 'reported_by',
] as const;

const MAX_BODY_BYTES = 32 * 1024; // metadata only; screenshots go to Storage

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'Payload too large' }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const projectId = typeof body.project_id === 'string' ? body.project_id.trim() : '';
  if (!projectId) return json({ error: 'project_id is required' }, 400);
  if (ALLOWED_PROJECTS.length > 0 && !ALLOWED_PROJECTS.includes(projectId)) {
    return json({ error: 'Unknown project' }, 403);
  }
  if (typeof body.description !== 'string' || !body.description.trim()) {
    return json({ error: 'description is required' }, 400);
  }

  // TODO(rate-limit): add a per-project/IP quota before insert. Requires a shared
  // store (a Postgres counter table with a SECURITY DEFINER check, or Upstash);
  // in-memory counters do not survive across isolate invocations.

  const insert: Record<string, unknown> = { project_id: projectId };
  for (const field of ALLOWED_FIELDS) {
    const value = body[field];
    if (value !== undefined && value !== '') insert[field] = value;
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  // The BEFORE INSERT trigger pseudonymizes reported_by; no raw PII is stored.
  const { data, error } = await supabase
    .from('bug_reports')
    .insert(insert)
    .select('id')
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ id: data.id }, 201);
});
