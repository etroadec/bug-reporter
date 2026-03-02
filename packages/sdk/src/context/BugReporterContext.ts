import { createContext } from 'react';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import type { BugReporterConfig, Translations } from '../types';

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
}

export const BugReporterContext = createContext<BugReporterContextValue | null>(null);
