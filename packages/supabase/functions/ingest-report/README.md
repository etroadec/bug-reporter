# ingest-report — validated ingestion gateway (reference)

**Status: reference implementation, not deployed and not yet wired.**

Recommended migration target for anonymous, multi-tenant report ingestion.

## Why
Today the SDK writes reports to Supabase directly with the embedded `anon` key.
Any holder of that key (extractable from any app bundle) can insert arbitrary
reports for any `project_id`, upload to the shared bucket, and there is no
rate-limiting. Routing writes through this function lets the server validate the
project, cap payload size, drop unknown fields, and rate-limit — without exposing
a direct table-write grant to clients.

## What it does
- `POST` JSON metadata → validates `project_id` (against `INGEST_ALLOWED_PROJECTS`),
  requires `description`, caps body at 32 KB, allowlists fields, inserts via the
  service role. The `bug_reports` trigger still pseudonymizes `reported_by`.
- Screenshots are unchanged: they keep going to Storage; only the metadata row
  flows through here.

## To adopt (future, requires an SDK release + app redeploy)
1. `supabase functions deploy ingest-report --no-verify-jwt`
2. Set `INGEST_ALLOWED_PROJECTS` in the function env.
3. Add rate-limiting (see `TODO(rate-limit)` in `index.ts`).
4. Point the SDK at this endpoint instead of `supabase-js`, then remove the
   anonymous `INSERT` policy on `bug_reports`.
