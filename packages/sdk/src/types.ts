export type BugCategory = 'Bug' | 'Crash' | 'UI' | 'Performance' | 'Feature Request' | 'Other';
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportedLocale = 'en' | 'fr';

export interface DeviceInfo {
  brand: string | null;
  model: string | null;
  os: string | null;
  osVersion: string | null;
}

export interface AppInfo {
  name: string | null;
  version: string | null;
  build: string | null;
}

export interface NetworkInfo {
  type: string | null;
  connected: boolean;
}

export interface BugReportPayload {
  screenshot_url?: string;
  description: string;
  category: BugCategory;
  severity?: BugSeverity;
  device_brand?: string | null;
  device_model?: string | null;
  device_os?: string | null;
  device_os_version?: string | null;
  app_name?: string | null;
  app_version?: string | null;
  app_build?: string | null;
  network_type?: string | null;
  network_connected?: boolean;
  current_screen?: string;
  timezone?: string;
  custom_data?: Record<string, unknown>;
  project_id: string;
  reported_by?: string;
}

export interface BugReporterConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  projectId: string;
  locale?: SupportedLocale;
  enableShake?: boolean;
  shakeThreshold?: number;
  floatingButton?: boolean;
  categories?: BugCategory[];
  defaultCategory?: BugCategory;
  onReportSubmitted?: (report: BugReportPayload) => void;
  currentScreen?: string;
  userId?: string;
  customData?: Record<string, unknown>;
}

export interface Translations {
  reportBug: string;
  description: string;
  descriptionPlaceholder: string;
  category: string;
  severity: string;
  submit: string;
  cancel: string;
  submitting: string;
  submitSuccess: string;
  submitError: string;
  screenshot: string;
  removeScreenshot: string;
  optional: string;
  severityLow: string;
  severityMedium: string;
  severityHigh: string;
  severityCritical: string;
}
