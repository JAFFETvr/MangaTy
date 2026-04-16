import { AuthButton } from '@/components/ui/AuthButton';
import { AuthInput } from '@/components/ui/AuthInput';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RegisterViewModel } from '../view-models/register-view-model';

interface RegisterScreenProps {
  onSwitchToLogin?: () => void;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
}

export function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ROLE_USER' | 'ROLE_CREATOR'>('ROLE_USER');
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [viewModel] = useState<RegisterViewModel>(() => serviceLocator.get(DIKeys.REGISTER_VIEW_MODEL));
  const [state, setState] = useState(viewModel.state.getValue());

  // Validación en tiempo real
  const validateUsername = (value: string) => {
    if (value.length < 3 && value.length > 0) {
      return 'Mínimo 3 caracteres';
    }
    if (value.length > 100) {
      return 'Máximo 100 caracteres';
    }
    return undefined;
  };

  const validateEmail = (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Correo inválido';
    }
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8 && value.length > 0) {
      return `${8 - value.length} caracteres más necesarios`;
    }
    return undefined;
  };

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
    const errors: ValidationErrors = {};

    if (!username || !email || !password) {
      setFormError('Por favor completa todos los campos');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Validar cada campo
    const usernameError = validateUsername(username);
    if (usernameError) errors.username = usernameError;

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setFormError(errors.password || errors.email || errors.username || 'Por favor revisa los campos');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setFormError(null);
    setValidationErrors({});
    await viewModel.register(username, email, password, role);
  };

  return (
    <View style={styles.formContainer}>
      <AuthInput
        icon="user"
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={(txt) => {
          setUsername(txt);
          const error = validateUsername(txt);
          setValidationErrors(prev => ({ ...prev, username: error }));
          setFormError(null);
        }}
        autoCapitalize="none"
        editable={!state.isLoading}
      />
      {validationErrors.username && (
        <Text style={styles.fieldError}>{validationErrors.username}</Text>
      )}

      <AuthInput
        icon="mail"
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(txt) => {
          setEmail(txt);
          const error = validateEmail(txt);
          setValidationErrors(prev => ({ ...prev, email: error }));
          setFormError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        secureTextEntry={false}
        editable={!state.isLoading}
      />
      {validationErrors.email && (
        <Text style={styles.fieldError}>{validationErrors.email}</Text>
      )}

      <AuthInput
        icon="lock"
        placeholder="Contraseña (mínimo 8 caracteres)"
        value={password}
        onChangeText={(txt) => {
          setPassword(txt);
          const error = validatePassword(txt);
          setValidationErrors(prev => ({ ...prev, password: error }));
          setFormError(null);
        }}
        secureTextEntry
        editable={!state.isLoading}
      />
      {validationErrors.password && (
        <Text style={styles.fieldError}>{validationErrors.password}</Text>
      )}

      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>Tipo de cuenta</Text>
        <View style={styles.roleButtonsRow}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'ROLE_USER' && styles.roleButtonActive]}
            onPress={() => setRole('ROLE_USER')}
            disabled={state.isLoading}
          >
            <Text style={[styles.roleButtonText, role === 'ROLE_USER' && styles.roleButtonTextActive]}>
              Lector
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'ROLE_CREATOR' && styles.roleButtonActive]}
            onPress={() => setRole('ROLE_CREATOR')}
            disabled={state.isLoading}
          >
            <Text style={[styles.roleButtonText, role === 'ROLE_CREATOR' && styles.roleButtonTextActive]}>
              Creador
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
  fieldError: {
    color: '#ff6b6b',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  roleContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1A1A2E',
    marginBottom: 8,
    fontWeight: '600',
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    borderColor: '#D8708E',
    backgroundColor: '#FDF1F5',
  },
  roleButtonText: {
    color: '#666',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#D8708E',
  },
  inlineError: {
    color: '#c33',
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
});
