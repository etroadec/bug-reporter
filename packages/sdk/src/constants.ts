import { BugCategory, BugSeverity } from './types';

export const DEFAULT_SHAKE_THRESHOLD = 1.8;
export const SHAKE_WINDOW_MS = 500;
export const SHAKE_COUNT = 3;
export const SHAKE_COOLDOWN_MS = 2000;

export const DEFAULT_CATEGORIES: BugCategory[] = ['Bug', 'Crash', 'UI', 'Performance', 'Feature Request', 'Other'];
export const SEVERITIES: BugSeverity[] = ['low', 'medium', 'high', 'critical'];

export const SCREENSHOT_QUALITY = 0.7;
export const SCREENSHOT_FORMAT = 'jpg' as const;
