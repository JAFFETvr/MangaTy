import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';

export type AuthMode = 'login' | 'register';

interface AuthSegmentedControlProps {
  mode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
}

export function AuthSegmentedControl({ mode, onChangeMode }: AuthSegmentedControlProps) {
  const theme = Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.authInputBg }]}>
      <TouchableOpacity 
        style={[styles.tab, mode === 'login' && { backgroundColor: theme.authPrimary }]} 
        activeOpacity={mode === 'login' ? 1 : 0.7}
        onPress={() => onChangeMode('login')}
      >
        <Text style={[styles.tabText, { color: mode === 'login' ? '#FFF' : theme.icon }]}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tab, mode === 'register' && { backgroundColor: theme.authPrimary }]} 
        activeOpacity={mode === 'register' ? 1 : 0.7}
        onPress={() => onChangeMode('register')}
      >
        <Text style={[styles.tabText, { color: mode === 'register' ? '#FFF' : theme.icon }]}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
});
