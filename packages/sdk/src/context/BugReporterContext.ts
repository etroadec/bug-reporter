import { createContext } from 'react';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import type { BugReporterConfig, Translations } from '../types';

export interface ScreenshotData {
  uri: string;
  url: string;
}

export interface BugReporterContextValue {
  config: BugReporterConfig;
  translations: Translations;
  isModalVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
  isBoardVisible: boolean;
  openBoard: () => void;
  closeBoard: () => void;
  viewRef: RefObject<View>;
  pendingScreenshot: ScreenshotData | null;
}

export const BugReporterContext = createContext<BugReporterContextValue | null>(null);
