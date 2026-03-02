import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useFeatureBoard } from '../hooks/useFeatureBoard';
import { useBugReporter } from '../hooks/useBugReporter';

interface FeatureBoardLinkProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
  label?: string;
}

export function FeatureBoardLink({ style, textStyle, label }: FeatureBoardLinkProps) {
  const { boardUrl, openFeatureBoard } = useFeatureBoard();
  const { translations } = useBugReporter();

  if (!boardUrl) return null;

  return (
    <TouchableOpacity
      onPress={openFeatureBoard}
      style={[styles.button, style]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, textStyle]}>
        {label ?? translations.suggestFeature}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
