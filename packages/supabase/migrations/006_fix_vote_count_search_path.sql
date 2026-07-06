-- Bug Reporter — fix update_vote_count() under an empty search_path (2026-07)
--
-- update_vote_count() (migration 002) referenced `feature_requests` without a
-- schema, so it resolved via the caller's search_path. That broke when the
-- vote is inserted/deleted by the SECURITY DEFINER RPCs cast_vote/remove_vote
-- (migration 005), which run with `search_path = ''` — the trigger then failed
-- with "relation feature_requests does not exist" and votes could not be cast.
--
-- Qualify the table and pin the function's own search_path so the trigger works
-- regardless of the caller (and clears the mutable-search_path advisor warning).

CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_requests SET vote_count = vote_count + 1 WHERE id = NEW.feature_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feature_requests SET vote_count = vote_count - 1 WHERE id = OLD.feature_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
