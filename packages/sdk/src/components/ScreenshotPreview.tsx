import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  uri: string;
  onRemove: () => void;
  removeLabel: string;
}

export function ScreenshotPreview({ uri, onRemove, removeLabel }: Props) {
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeText}>{removeLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  removeButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  removeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
