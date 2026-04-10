import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
}

export function AuthButton({ title, isLoading, style, ...props }: AuthButtonProps) {
  const theme = Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme.authButton },
        props.disabled && styles.disabled,
        style
      ]}
      disabled={isLoading || props.disabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#C87889',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
});
