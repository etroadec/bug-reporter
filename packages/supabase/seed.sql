-- Seed data for development/testing

-- Bug reports
INSERT INTO bug_reports (project_id, description, category, severity, status, device_brand, device_model, device_os, device_os_version, app_name, app_version, app_build, network_type, network_connected, current_screen, timezone)
VALUES
  ('demo-project', 'App crashes when tapping the profile button on the home screen', 'Crash', 'critical', 'open', 'Apple', 'iPhone 15 Pro', 'iOS', '18.2', 'MyApp', '2.1.0', '142', 'wifi', true, 'HomeScreen', 'Europe/Paris'),
  ('demo-project', 'Login button is not visible in dark mode', 'UI', 'high', 'open', 'Samsung', 'Galaxy S24', 'Android', '15', 'MyApp', '2.1.0', '142', 'cellular', true, 'LoginScreen', 'America/New_York'),
  ('demo-project', 'Push notifications are not received after app update', 'Bug', 'high', 'in_progress', 'Apple', 'iPhone 14', 'iOS', '18.1', 'MyApp', '2.0.9', '140', 'wifi', true, 'SettingsScreen', 'Europe/London'),
  ('demo-project', 'Would be great to have a search feature in the settings', 'Feature Request', 'low', 'open', 'Google', 'Pixel 8', 'Android', '14', 'MyApp', '2.1.0', '142', 'wifi', true, 'SettingsScreen', 'Asia/Tokyo'),
  ('demo-project', 'Image upload takes too long on slow connections', 'Performance', 'medium', 'resolved', 'Apple', 'iPhone 13', 'iOS', '17.5', 'MyApp', '2.0.8', '138', 'cellular', true, 'UploadScreen', 'Europe/Paris');

-- Feature requests
INSERT INTO feature_requests (project_id, title, description, category, status, vote_count, submitted_by)
VALUES
  ('demo-project', 'Dark mode support', 'It would be great to have a dark mode option throughout the app to reduce eye strain at night.', 'UI/UX', 'planned', 12, 'user-1'),
  ('demo-project', 'Export data as CSV', 'Allow users to export their data in CSV format for use in spreadsheets and other tools.', 'New Feature', 'under_review', 8, 'user-2'),
  ('demo-project', 'Faster image loading', 'Images take too long to load on the feed. Consider lazy loading or progressive image rendering.', 'Performance', 'in_progress', 15, 'user-3'),
  ('demo-project', 'Slack integration', 'Add the ability to send notifications directly to a Slack channel when important events occur.', 'Integration', 'completed', 20, 'user-4'),
  ('demo-project', 'Improved onboarding flow', 'The current onboarding is confusing. A step-by-step wizard would help new users get started faster.', 'Improvement', 'declined', 3, 'user-5');
