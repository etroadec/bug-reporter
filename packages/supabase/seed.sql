-- Seed data for development/testing

INSERT INTO bug_reports (project_id, description, category, severity, status, device_brand, device_model, device_os, device_os_version, app_name, app_version, app_build, network_type, network_connected, current_screen, timezone)
VALUES
  ('demo-project', 'App crashes when tapping the profile button on the home screen', 'Crash', 'critical', 'open', 'Apple', 'iPhone 15 Pro', 'iOS', '18.2', 'MyApp', '2.1.0', '142', 'wifi', true, 'HomeScreen', 'Europe/Paris'),
  ('demo-project', 'Login button is not visible in dark mode', 'UI', 'high', 'open', 'Samsung', 'Galaxy S24', 'Android', '15', 'MyApp', '2.1.0', '142', 'cellular', true, 'LoginScreen', 'America/New_York'),
  ('demo-project', 'Push notifications are not received after app update', 'Bug', 'high', 'in_progress', 'Apple', 'iPhone 14', 'iOS', '18.1', 'MyApp', '2.0.9', '140', 'wifi', true, 'SettingsScreen', 'Europe/London'),
  ('demo-project', 'Would be great to have a search feature in the settings', 'Feature Request', 'low', 'open', 'Google', 'Pixel 8', 'Android', '14', 'MyApp', '2.1.0', '142', 'wifi', true, 'SettingsScreen', 'Asia/Tokyo'),
  ('demo-project', 'Image upload takes too long on slow connections', 'Performance', 'medium', 'resolved', 'Apple', 'iPhone 13', 'iOS', '17.5', 'MyApp', '2.0.8', '138', 'cellular', true, 'UploadScreen', 'Europe/Paris');
