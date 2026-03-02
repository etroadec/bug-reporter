import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useBugReporter } from '../hooks/useBugReporter';
import { useFeatureBoard } from '../hooks/useFeatureBoard';

export function FeatureBoardModal() {
  const { translations, isBoardVisible, closeBoard } = useBugReporter();
  const { boardUrl } = useFeatureBoard();

  if (!boardUrl) return null;

  return (
    <Modal visible={isBoardVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={closeBoard}>
      <View style={styles.container}>
        <View style={styles.safeTop} />
        <View style={styles.header}>
          <TouchableOpacity onPress={closeBoard}>
            <Text style={styles.closeText}>{translations.cancel}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{translations.featureBoard}</Text>
          <View style={styles.placeholder} />
        </View>
        <WebView
          source={{ uri: boardUrl }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeTop: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 44 : 54,
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
  closeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  placeholder: {
    width: 50,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
