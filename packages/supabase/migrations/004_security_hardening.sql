-- Bug Reporter — Security hardening (incident remediation, 2026-07)
--
-- Reconciles the schema with the fixes applied to production after the data
-- exposure incident. Idempotent: safe to run on a fresh database (after 001-003)
-- or against an already-hardened project.
--
-- Summary of the hardened state this migration establishes:
--   * screenshots bucket is PRIVATE (no anonymous reads)
--   * anonymous access to bug_reports/screenshots is WRITE-ONLY (ingestion)
--   * any email-looking identifier is pseudonymized at insert time (no PII at rest)
--   * the public board keeps anonymous read/submit/vote, but without stored PII

-- =============================================================================
-- 1) Screenshots bucket → private (was created public in 001)
-- =============================================================================
UPDATE storage.buckets SET public = false WHERE id = 'screenshots';

-- Remove public read; screenshots are now viewed via signed URLs (service role).
DROP POLICY IF EXISTS "Public read screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read screenshots" ON storage.objects;
CREATE POLICY "Authenticated read screenshots"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'screenshots');

-- =============================================================================
-- 2) Anonymous ingestion is WRITE-ONLY, scoped to the anon role
-- =============================================================================
DROP POLICY IF EXISTS "Allow anonymous inserts" ON bug_reports;
CREATE POLICY "Allow anonymous inserts"
  ON bug_reports FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous screenshot uploads" ON storage.objects;
CREATE POLICY "Allow anonymous screenshot uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'screenshots');

-- =============================================================================
-- 3) Pseudonymize email-looking identifiers at insert (no PII at rest)
--    Covers reports coming from apps already in production, without any redeploy.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.pseudonymize_email(v text)
RETURNS text
LANGUAGE sql IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN v IS NULL THEN NULL
    WHEN position('@' in v) = 0 THEN v                    -- already opaque
    ELSE 'u_' || substr(md5(lower(btrim(v))), 1, 16)     -- stable pseudonym
  END;
$$;

CREATE OR REPLACE FUNCTION public.tg_scrub_bug_reporter()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.reported_by := public.pseudonymize_email(NEW.reported_by);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_scrub_feature_submitter()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.submitted_by := public.pseudonymize_email(NEW.submitted_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_scrub_bug_reporter ON bug_reports;
CREATE TRIGGER trg_scrub_bug_reporter
  BEFORE INSERT ON bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.tg_scrub_bug_reporter();

DROP TRIGGER IF EXISTS trg_scrub_feature_submitter ON feature_requests;
CREATE TRIGGER trg_scrub_feature_submitter
  BEFORE INSERT ON feature_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_scrub_feature_submitter();

-- =============================================================================
-- 4) Public board policies rescoped to the anon role (same behavior, explicit)
-- =============================================================================
DROP POLICY IF EXISTS "Public read feature requests" ON feature_requests;
CREATE POLICY "Public read feature requests"
  ON feature_requests FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous feature request inserts" ON feature_requests;
CREATE POLICY "Allow anonymous feature request inserts"
  ON feature_requests FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public read feature votes" ON feature_votes;
CREATE POLICY "Public read feature votes"
  ON feature_votes FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous voting" ON feature_votes;
CREATE POLICY "Allow anonymous voting"
  ON feature_votes FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous unvoting" ON feature_votes;
CREATE POLICY "Allow anonymous unvoting"
  ON feature_votes FOR DELETE TO anon
  USING (true);

-- =============================================================================
-- 5) Pseudonymize identifiers already stored in the public board
-- =============================================================================
UPDATE feature_requests
  SET submitted_by = public.pseudonymize_email(submitted_by)
  WHERE submitted_by IS NOT NULL AND position('@' in submitted_by) > 0;

-- NOTE: existing bug_reports.reported_by emails are intentionally NOT rewritten
-- here — that table is not anonymously readable, so there is no public exposure.
-- Pseudonymize them separately (data-minimization) if the retention policy requires it.

-- =============================================================================
-- 6) Stop exposing the RLS auto-enable event-trigger function over the REST API
--    It is an event-trigger helper; it must never be callable via /rest/v1/rpc.
--    Guarded so a database without this Supabase-managed function is unaffected.
-- =============================================================================
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public';
  END IF;
END $$;
