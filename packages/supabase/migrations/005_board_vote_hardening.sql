-- Bug Reporter — Board vote hardening & PII column lockdown (2026-07)
--
-- DEPLOY ORDER: apply this migration together with (or just before) the matching
-- board frontend release. It requires the board build that (a) casts/removes
-- votes through the RPCs below and (b) reads feature_requests with an explicit
-- non-PII column list. Applying it while an older board using direct vote writes
-- or select('*') is still live would break that board.

-- =============================================================================
-- 1) Votes go through SECURITY DEFINER RPCs scoped to a single (feature, voter)
--    The previous "Allow anonymous unvoting" USING (true) let any anon delete
--    ANY vote (`delete().neq('id', …)` wiped the table). These RPCs only ever
--    touch the exact (feature_request_id, voter_id) row.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.cast_vote(p_feature_request_id uuid, p_voter_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.feature_votes (feature_request_id, voter_id)
  VALUES (p_feature_request_id, p_voter_id)
  ON CONFLICT (feature_request_id, voter_id) DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION public.remove_vote(p_feature_request_id uuid, p_voter_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.feature_votes
  WHERE feature_request_id = p_feature_request_id
    AND voter_id = p_voter_id;
$$;

REVOKE ALL ON FUNCTION public.cast_vote(uuid, text) FROM public;
REVOKE ALL ON FUNCTION public.remove_vote(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.cast_vote(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_vote(uuid, text) TO anon, authenticated;

-- =============================================================================
-- 2) Remove direct anonymous write access to feature_votes (RPC-only now)
-- =============================================================================
DROP POLICY IF EXISTS "Allow anonymous voting" ON public.feature_votes;
DROP POLICY IF EXISTS "Allow anonymous unvoting" ON public.feature_votes;
-- SELECT ("Public read feature votes") is kept: the board reads votes to know
-- whether the current voter has already voted.

-- =============================================================================
-- 3) Hide submitted_by from the anon role at the column level (defense in depth)
--    The board already reads only non-PII columns; this makes a forged
--    `select('submitted_by')` with the anon key fail as well.
-- =============================================================================
REVOKE SELECT ON public.feature_requests FROM anon;
GRANT SELECT (
  id, title, description, category, status,
  vote_count, admin_response, created_at, project_id
) ON public.feature_requests TO anon;
