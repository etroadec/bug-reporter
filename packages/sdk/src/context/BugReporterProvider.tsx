import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { captureScreen } from 'react-native-view-shot';
import { createClient } from '@supabase/supabase-js';
import { BugReporterContext } from './BugReporterContext';
import type { ScreenshotData } from './BugReporterContext';
import { ReportModal } from '../components/ReportModal';
import { FeatureBoardModal } from '../components/FeatureBoardModal';
import { FloatingButton } from '../components/FloatingButton';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { getTranslations } from '../i18n';
import { SCREENSHOT_FORMAT, SCREENSHOT_QUALITY } from '../constants';
import { base64ToArrayBuffer } from '../utils/base64';
import type { BugReporterConfig } from '../types';

interface Props {
  config: BugReporterConfig;
  children: React.ReactNode;
}

export function BugReporterProvider({ config, children }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBoardVisible, setIsBoardVisible] = useState(false);
  const [pendingScreenshot, setPendingScreenshot] = useState<ScreenshotData | null>(null);
  const viewRef = useRef<View>(null);
  const translations = getTranslations(config.locale);

  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setPendingScreenshot(null);
  }, []);
  const openBoard = useCallback(() => setIsBoardVisible(true), []);
  const closeBoard = useCallback(() => setIsBoardVisible(false), []);

  // Capture screenshot BEFORE opening modal to avoid iOS crash.
  // Uses captureScreen to capture actual displayed pixels instead of view hierarchy,
  // which avoids capturing the wrong screen in stack navigators.
  const captureAndOpenModal = useCallback(async () => {
    try {
        const uri = await captureScreen({
          format: SCREENSHOT_FORMAT,
          quality: SCREENSHOT_QUALITY,
        });
        const base64 = await captureScreen({
          format: SCREENSHOT_FORMAT,
          quality: SCREENSHOT_QUALITY,
          result: 'base64',
        });

        // Upload to Supabase Storage
        const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
        const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const fileName = `${config.projectId}/${uniqueId}.jpg`;
        const arrayBuffer = base64ToArrayBuffer(base64);

        const { error } = await supabase.storage
          .from('screenshots')
          .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

        if (error) {
          setPendingScreenshot({ uri, url: '' });
        } else {
          const { data } = supabase.storage.from('screenshots').getPublicUrl(fileName);
          setPendingScreenshot({ uri, url: data.publicUrl });
        }
    } catch {
      // Screenshot failed — open modal without screenshot
    }
    setIsModalVisible(true);
  }, [config]);

  const shakeEnabled = config.enableShake ?? !__DEV__;

  useShakeDetection({
    enabled: shakeEnabled,
    threshold: config.shakeThreshold,
    onShake: captureAndOpenModal,
  });

  return (
    <BugReporterContext.Provider
      value={{ config, translations, isModalVisible, openModal, closeModal, isBoardVisible, openBoard, closeBoard, viewRef, pendingScreenshot }}
    >
      <View ref={viewRef} collapsable={false} style={styles.container}>
        {children}
      </View>
      {config.floatingButton !== false && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <FloatingButton onPress={captureAndOpenModal} style={config.floatingButtonStyle} />
        </View>
      )}
      <ReportModal />
      <FeatureBoardModal />
    </BugReporterContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
