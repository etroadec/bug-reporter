// Bug Reporter — validated ingestion gateway (REFERENCE IMPLEMENTATION)
//
// Status: NOT deployed / NOT yet wired. This is the recommended migration target
// for anonymous, multi-tenant ingestion. Today the SDK writes to Supabase directly
// with the embedded anon key, which means any holder of that key can insert
// arbitrary reports for any project_id. Routing writes through this Edge Function
// lets us: validate the project, cap payload size, validate/allowlist fields, and
// (once a store is added) rate-limit — without ever exposing a table-write grant.
//
// Deploy (when adopted):
//   supabase functions deploy ingest-report --no-verify-jwt
// Required function env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-provided by the platform)
//   INGEST_ALLOWED_PROJECTS = comma-separated project_id allowlist (REQUIRED;
//                             empty ⇒ ingestion refused, fail-closed)
// SDK change required: POST the report JSON here instead of calling supabase-js.
// Screenshots keep going to Storage (separate upload); only the metadata row
// flows through this function.
//
// NOTE: the bug_reports BEFORE INSERT trigger still pseudonymizes reported_by,
// so this path inherits the same PII protection as the direct path.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_PROJECTS = (Deno.env.get('INGEST_ALLOWED_PROJECTS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Per-field validation: expected type and (for strings) a max length. Only these
// fields are ever forwarded to the database; anything else is dropped.
type FieldRule = { type: 'string' | 'boolean'; max?: number };
const FIELD_RULES: Record<string, FieldRule> = {
  description: { type: 'string', max: 5000 },
  category: { type: 'string', max: 50 },
  severity: { type: 'string', max: 20 },
  screenshot_url: { type: 'string', max: 400 },
  device_brand: { type: 'string', max: 100 },
  device_model: { type: 'string', max: 100 },
  device_os: { type: 'string', max: 50 },
  device_os_version: { type: 'string', max: 50 },
  app_name: { type: 'string', max: 100 },
  app_version: { type: 'string', max: 50 },
  app_build: { type: 'string', max: 50 },
  network_type: { type: 'string', max: 50 },
  network_connected: { type: 'boolean' },
  current_screen: { type: 'string', max: 200 },
  timezone: { type: 'string', max: 100 },
  reported_by: { type: 'string', max: 200 },
};
const CUSTOM_DATA_MAX_BYTES = 8 * 1024;
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

  // Fail closed: without a configured allowlist, refuse everything.
  if (ALLOWED_PROJECTS.length === 0) {
    console.error('ingest-report: INGEST_ALLOWED_PROJECTS is not configured');
    return json({ error: 'Ingestion not configured' }, 503);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'Payload too large' }, 413);

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json({ error: 'Invalid body' }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const projectId = typeof body.project_id === 'string' ? body.project_id.trim() : '';
  if (!projectId || !ALLOWED_PROJECTS.includes(projectId)) {
    return json({ error: 'Unknown project' }, 403);
  }
  if (typeof body.description !== 'string' || !body.description.trim()) {
    return json({ error: 'description is required' }, 400);
  }

  // TODO(rate-limit): add a per-project/IP quota before insert. Requires a shared
  // store (a Postgres counter table with a SECURITY DEFINER check, or Upstash);
  // in-memory counters do not survive across isolate invocations.

  const insert: Record<string, unknown> = { project_id: projectId };
  for (const [field, rule] of Object.entries(FIELD_RULES)) {
    const value = body[field];
    if (value === undefined || value === null || value === '') continue;
    if (typeof value !== rule.type) {
      return json({ error: `Invalid field: ${field}` }, 400);
    }
    if (rule.type === 'string' && rule.max && (value as string).length > rule.max) {
      return json({ error: `Field too long: ${field}` }, 400);
    }
    insert[field] = value;
  }

  // custom_data: arbitrary JSON object, size-capped by its serialized form.
  if (body.custom_data !== undefined && body.custom_data !== null) {
    const cd = body.custom_data;
    if (typeof cd !== 'object' || Array.isArray(cd)) {
      return json({ error: 'Invalid field: custom_data' }, 400);
    }
    if (JSON.stringify(cd).length > CUSTOM_DATA_MAX_BYTES) {
      return json({ error: 'Field too long: custom_data' }, 400);
    }
    insert.custom_data = cd;
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

  if (error) {
    // Log the detail server-side; never leak DB internals to the caller.
    console.error('ingest-report: insert failed', error);
    return json({ error: 'Internal error' }, 500);
  }
  return json({ id: data.id }, 201);
});
