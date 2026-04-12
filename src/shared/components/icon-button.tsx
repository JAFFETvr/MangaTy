/**
 * IconButton Component
 */

import { COLORS } from '@/src/core/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  isActive?: boolean;
  backgroundColor?: string;
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.pink,
  },
  inactiveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});

export function IconButton({
  icon,
  onPress,
  size = 20,
  isActive = false,
  backgroundColor,
}: IconButtonProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        backgroundColor
          ? { backgroundColor }
          : isActive
            ? styles.activeButton
            : styles.inactiveButton,
      ]}
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
}
