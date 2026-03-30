-- Migration 003: Add "test" status support + bug_comments table
-- The status column is TEXT so no enum change is needed for "test".
-- The comment below updates the documentation.
-- Status values: open, in_progress, resolved, test, closed

COMMENT ON COLUMN bug_reports.status IS 'open | in_progress | resolved | test | closed';

-- =============================================================================
-- Table: bug_comments
-- =============================================================================
CREATE TABLE bug_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bug_id UUID NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
  author TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bug_comments_bug_id ON bug_comments(bug_id);
CREATE INDEX idx_bug_comments_created ON bug_comments(created_at DESC);

-- =============================================================================
-- RLS Policies for bug_comments
-- =============================================================================
ALTER TABLE bug_comments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read comments
CREATE POLICY "Authenticated users can read comments"
  ON bug_comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON bug_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete comments
CREATE POLICY "Authenticated users can delete comments"
  ON bug_comments FOR DELETE
  USING (auth.role() = 'authenticated');
