-- Bug Reporter — Initial Schema
-- Creates the bug_reports table, indexes, storage bucket, and RLS policies

-- =============================================================================
-- Table: bug_reports
-- =============================================================================
CREATE TABLE bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  screenshot_url TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Bug',
  severity TEXT,
  status TEXT NOT NULL DEFAULT 'open',  -- open, in_progress, resolved, closed

  -- Device metadata
  device_brand TEXT,
  device_model TEXT,
  device_os TEXT,
  device_os_version TEXT,

  -- App metadata
  app_name TEXT,
  app_version TEXT,
  app_build TEXT,

  -- Network metadata
  network_type TEXT,
  network_connected BOOLEAN,

  -- Context
  current_screen TEXT,
  timezone TEXT,
  custom_data JSONB,

  -- Multi-project & tracking
  project_id TEXT NOT NULL,
  reported_by TEXT,
  assigned_to TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- Indexes
-- =============================================================================
CREATE INDEX idx_bug_reports_project ON bug_reports(project_id);
CREATE INDEX idx_bug_reports_status ON bug_reports(status);
CREATE INDEX idx_bug_reports_created ON bug_reports(created_at DESC);
CREATE INDEX idx_bug_reports_category ON bug_reports(category);
CREATE INDEX idx_bug_reports_severity ON bug_reports(severity);

-- =============================================================================
-- Updated_at trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- Storage bucket for screenshots
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true);

-- =============================================================================
-- RLS Policies
-- =============================================================================
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Anyone with the anon key can insert bug reports (SDK sends from mobile apps)
CREATE POLICY "Allow anonymous inserts"
  ON bug_reports FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admin) can read bug reports
CREATE POLICY "Authenticated users can read"
  ON bug_reports FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users (admin) can update bug reports
CREATE POLICY "Authenticated users can update"
  ON bug_reports FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users (admin) can delete bug reports
CREATE POLICY "Authenticated users can delete"
  ON bug_reports FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================================================
-- Storage RLS: screenshots bucket
-- =============================================================================

-- Anyone can read screenshots (bucket is public)
CREATE POLICY "Public read screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'screenshots');

-- Anyone with anon key can upload screenshots (SDK sends from mobile apps)
CREATE POLICY "Allow anonymous screenshot uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'screenshots');

-- Authenticated users can delete screenshots
CREATE POLICY "Authenticated users can delete screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'screenshots' AND auth.role() = 'authenticated');
