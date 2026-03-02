-- BugnFeat Reporter — Feature Requests Schema
-- Creates feature_requests and feature_votes tables, triggers, indexes, and RLS policies

-- =============================================================================
-- Table: feature_requests
-- =============================================================================
CREATE TABLE feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'New Feature', -- UI/UX, Performance, New Feature, Integration, Improvement, Other
  status TEXT NOT NULL DEFAULT 'under_review',  -- under_review, planned, in_progress, completed, declined
  vote_count INTEGER NOT NULL DEFAULT 0,        -- denormalized, updated by trigger
  project_id TEXT NOT NULL,
  submitted_by TEXT,
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- Table: feature_votes
-- =============================================================================
CREATE TABLE feature_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_request_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(feature_request_id, voter_id)
);

-- =============================================================================
-- Trigger: update vote_count on feature_requests
-- =============================================================================
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feature_requests SET vote_count = vote_count + 1 WHERE id = NEW.feature_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feature_requests SET vote_count = vote_count - 1 WHERE id = OLD.feature_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_vote_count
  AFTER INSERT OR DELETE ON feature_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_count();

-- Reuse the existing update_updated_at() function from migration 001
CREATE TRIGGER set_feature_requests_updated_at
  BEFORE UPDATE ON feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- Indexes: feature_requests
-- =============================================================================
CREATE INDEX idx_feature_requests_project ON feature_requests(project_id);
CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feature_requests_created ON feature_requests(created_at DESC);
CREATE INDEX idx_feature_requests_votes ON feature_requests(vote_count DESC);
CREATE INDEX idx_feature_requests_category ON feature_requests(category);

-- =============================================================================
-- Indexes: feature_votes
-- =============================================================================
CREATE INDEX idx_feature_votes_request ON feature_votes(feature_request_id);
CREATE INDEX idx_feature_votes_voter ON feature_votes(voter_id);

-- =============================================================================
-- RLS Policies: feature_requests
-- =============================================================================
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Public board: anyone can read feature requests
CREATE POLICY "Public read feature requests"
  ON feature_requests FOR SELECT
  USING (true);

-- Anyone with anon key can submit feature requests
CREATE POLICY "Allow anonymous feature request inserts"
  ON feature_requests FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admin) can update feature requests
CREATE POLICY "Authenticated users can update feature requests"
  ON feature_requests FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users (admin) can delete feature requests
CREATE POLICY "Authenticated users can delete feature requests"
  ON feature_requests FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================================================
-- RLS Policies: feature_votes
-- =============================================================================
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes
CREATE POLICY "Public read feature votes"
  ON feature_votes FOR SELECT
  USING (true);

-- Anyone can vote (insert)
CREATE POLICY "Allow anonymous voting"
  ON feature_votes FOR INSERT
  WITH CHECK (true);

-- Anyone can unvote (delete their own vote by voter_id)
CREATE POLICY "Allow anonymous unvoting"
  ON feature_votes FOR DELETE
  USING (true);
