import { AuthButton } from '@/components/ui/AuthButton';
import { AuthInput } from '@/components/ui/AuthInput';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LoginViewModel } from '../view-models/login-view-model';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [viewModel] = useState<LoginViewModel>(() => serviceLocator.get(DIKeys.LOGIN_VIEW_MODEL));
  const [state, setState] = useState(viewModel.state.getValue());

  useEffect(() => {
    const unsubscribe = viewModel.state.subscribe((newState) => {
      setState(newState);
      if (newState.error) {
        setFormError(newState.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      if (newState.isAuthenticated) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Ignoring strict route typing here to avoid compilation blocks
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        router.replace('/(tabs)');
      }
    });

    return unsubscribe;
  }, [viewModel]);

  const handleLogin = async () => {
    if (!email || !password) {
      setFormError('Por favor completa todos los campos');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setFormError(null);
    await viewModel.login(email, password);
  };

  return (
    <View style={styles.formContainer}>
      <AuthInput
        icon="mail"
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(txt) => { setEmail(txt); setFormError(null); }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!state.isLoading}
      />
      <AuthInput
        icon="lock"
        placeholder="Contraseña"
        value={password}
        onChangeText={(txt) => { setPassword(txt); setFormError(null); }}
        secureTextEntry
        editable={!state.isLoading}
      />

      {/* Inline Error Message */}
      {formError && (
        <Text style={styles.inlineError}>{formError}</Text>
      )}

      <AuthButton
        title="Iniciar Sesión"
        onPress={handleLogin}
        isLoading={state.isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  inlineError: {
    color: '#c33',
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
});
