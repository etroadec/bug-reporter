-- Bug Reporter — keep reporter emails on bug_reports (2026-07)
--
-- reported_by on bug_reports is admin-only (the table is never anonymously
-- readable) and is needed to identify/contact the person who reported a bug.
-- Stop pseudonymizing it. The PUBLIC board (feature_requests.submitted_by)
-- keeps its pseudonymization — those authors are shown on a public page.

DROP TRIGGER IF EXISTS trg_scrub_bug_reporter ON public.bug_reports;
DROP FUNCTION IF EXISTS public.tg_scrub_bug_reporter();
