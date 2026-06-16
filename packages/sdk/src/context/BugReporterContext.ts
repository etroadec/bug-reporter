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
  /**
   * Ouvre la modale de report.
   * @param options.screenshot Force (ou désactive) la capture auto pour cet appel,
   *   prioritaire sur `config.captureScreenshotOnOpen`.
   */
  openModal: (options?: { screenshot?: boolean }) => void;
  closeModal: () => void;
  /** Capture auto résolue pour l'ouverture courante (override > config > true). */
  autoCaptureOnOpen: boolean;
  isBoardVisible: boolean;
  openBoard: () => void;
  closeBoard: () => void;
  viewRef: RefObject<View>;
  pendingScreenshot: ScreenshotData | null;
}

export const BugReporterContext = createContext<BugReporterContextValue | null>(null);
