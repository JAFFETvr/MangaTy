import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { AuthSegmentedControl, AuthMode } from '@/components/ui/AuthSegmentedControl';
import { LoginScreen } from '@/src/features/auth/login/presentation/screens/login-screen';
import { RegisterScreen } from '@/src/features/auth/register/presentation/screens/register-screen';
import { TYPOGRAPHY } from '@/src/core/theme/typography';

export default function AuthIndex() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Logo and Subtitle */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Lee y apoya a creadores independientes
          </Text>
        </View>

        {/* Tab Toggle - No Routing, 100% Fluid */}
        <AuthSegmentedControl mode={mode} onChangeMode={setMode} />

        {/* Dynamic Form */}
        {mode === 'login' ? <LoginScreen /> : <RegisterScreen onSwitchToLogin={() => setMode('login')} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 250,
    height: 120,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1A1A2E',
    textAlign: 'center',
    opacity: 0.6,
  },
});
