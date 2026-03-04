import React from 'react';
import { Modal, TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';

interface Props {
  onPress: () => void;
  style?: ViewStyle;
}

export function FloatingButton({ onPress, style }: Props) {
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.icon}>🐛</Text>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  icon: {
    fontSize: 24,
  },
});
