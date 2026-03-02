import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BugReporterContext } from './BugReporterContext';
import { ReportModal } from '../components/ReportModal';
import { FeatureBoardModal } from '../components/FeatureBoardModal';
import { FloatingButton } from '../components/FloatingButton';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { getTranslations } from '../i18n';
import type { BugReporterConfig } from '../types';

interface Props {
  config: BugReporterConfig;
  children: React.ReactNode;
}

export function BugReporterProvider({ config, children }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBoardVisible, setIsBoardVisible] = useState(false);
  const viewRef = useRef<View>(null);
  const translations = getTranslations(config.locale);

  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);
  const openBoard = useCallback(() => setIsBoardVisible(true), []);
  const closeBoard = useCallback(() => setIsBoardVisible(false), []);

  const shakeEnabled = config.enableShake ?? !__DEV__;

  useShakeDetection({
    enabled: shakeEnabled,
    threshold: config.shakeThreshold,
    onShake: openModal,
  });

  return (
    <BugReporterContext.Provider
      value={{ config, translations, isModalVisible, openModal, closeModal, isBoardVisible, openBoard, closeBoard, viewRef }}
    >
      <View ref={viewRef} collapsable={false} style={styles.container}>
        {children}
      </View>
      {config.floatingButton !== false && <FloatingButton onPress={openModal} />}
      <ReportModal />
      <FeatureBoardModal />
    </BugReporterContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
