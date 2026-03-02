import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useBugReporter } from '../hooks/useBugReporter';
import { useScreenCapture } from '../hooks/useScreenCapture';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { ScreenshotPreview } from './ScreenshotPreview';
import { DEFAULT_CATEGORIES, SEVERITIES } from '../constants';
import type { BugCategory, BugSeverity, BugReportPayload } from '../types';

export function ReportModal() {
  const { config, translations, isModalVisible, closeModal } = useBugReporter();
  const { captureScreenshot, uploadScreenshot } = useScreenCapture();
  const { getDeviceInfo, getAppInfo, getNetworkInfo } = useDeviceInfo();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BugCategory>(config.defaultCategory ?? 'Bug');
  const [severity, setSeverity] = useState<BugSeverity | undefined>();
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = config.categories ?? DEFAULT_CATEGORIES;

  // Capture screenshot when modal opens
  useEffect(() => {
    if (isModalVisible) {
      captureScreenshot().then(setScreenshotUri);
    } else {
      // Reset form when modal closes
      setDescription('');
      setCategory(config.defaultCategory ?? 'Bug');
      setSeverity(undefined);
      setScreenshotUri(null);
      setIsSubmitting(false);
    }
  }, [isModalVisible]);

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);

    try {
      const device = getDeviceInfo();
      const app = getAppInfo();
      const network = await getNetworkInfo();

      let screenshotUrl: string | undefined;
      if (screenshotUri) {
        const url = await uploadScreenshot(screenshotUri);
        if (url) screenshotUrl = url;
      }

      const payload: BugReportPayload = {
        description: description.trim(),
        category,
        severity,
        screenshot_url: screenshotUrl,
        device_brand: device.brand,
        device_model: device.model,
        device_os: device.os,
        device_os_version: device.osVersion,
        app_name: app.name,
        app_version: app.version,
        app_build: app.build,
        network_type: network.type,
        network_connected: network.connected,
        current_screen: config.currentScreen,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        custom_data: config.customData,
        project_id: config.projectId,
        reported_by: config.userId,
      };

      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { error } = await supabase.from('bug_reports').insert(payload);

      if (error) throw error;

      config.onReportSubmitted?.(payload);
      Alert.alert('', translations.submitSuccess);
      closeModal();
    } catch {
      Alert.alert('', translations.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }, [description, category, severity, screenshotUri, config, translations, closeModal]);

  return (
    <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={closeModal} disabled={isSubmitting}>
            <Text style={styles.cancelText}>{translations.cancel}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{translations.reportBug}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting || !description.trim()}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Text style={[styles.submitText, !description.trim() && styles.disabledText]}>
                {translations.submit}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          {/* Screenshot */}
          {screenshotUri && (
            <View style={styles.section}>
              <Text style={styles.label}>{translations.screenshot}</Text>
              <ScreenshotPreview uri={screenshotUri} onRemove={() => setScreenshotUri(null)} removeLabel={translations.removeScreenshot} />
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>{translations.description}</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder={translations.descriptionPlaceholder}
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>{translations.category}</Text>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {translations.severity} <Text style={styles.optional}>({translations.optional})</Text>
            </Text>
            <View style={styles.chipRow}>
              {SEVERITIES.map((sev) => {
                const labels: Record<string, string> = {
                  low: translations.severityLow,
                  medium: translations.severityMedium,
                  high: translations.severityHigh,
                  critical: translations.severityCritical,
                };
                return (
                  <TouchableOpacity
                    key={sev}
                    style={[styles.chip, severity === sev && styles.chipActive]}
                    onPress={() => setSeverity(severity === sev ? undefined : sev)}
                  >
                    <Text style={[styles.chipText, severity === sev && styles.chipTextActive]}>{labels[sev]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  submitText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.4,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    color: '#9ca3af',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});
