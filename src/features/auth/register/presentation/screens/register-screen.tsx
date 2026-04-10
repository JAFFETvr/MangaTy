import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AuthInput } from '@/components/ui/AuthInput';
import { AuthButton } from '@/components/ui/AuthButton';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { RegisterViewModel } from '../view-models/register-view-model';

interface RegisterScreenProps {
  onSwitchToLogin?: () => void;
}

export function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const [viewModel] = useState<RegisterViewModel>(() => serviceLocator.get(DIKeys.REGISTER_VIEW_MODEL));
  const [state, setState] = useState(viewModel.state.getValue());

  useEffect(() => {
    const unsubscribe = viewModel.state.subscribe((newState) => {
      setState(newState);
      if (newState.error) {
        setFormError(newState.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      if (newState.isRegistered) {
        setFormError(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (onSwitchToLogin) onSwitchToLogin();
      }
    });

    return unsubscribe;
  }, [viewModel, onSwitchToLogin]);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setFormError('Por favor completa todos los campos');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setFormError(null);
    await viewModel.register(username, email, password);
  };

  return (
    <View style={styles.formContainer}>
      <AuthInput
        icon="user"
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={(txt) => { setUsername(txt); setFormError(null); }}
        autoCapitalize="none"
        editable={!state.isLoading}
      />
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
        title="Crear Cuenta"
        onPress={handleRegister}
        isLoading={state.isLoading}
        style={{ marginTop: 16 }}
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
