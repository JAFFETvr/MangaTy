import { COLORS } from '@/src/core/theme/colors';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { RegisterViewModel } from '../view-models/register-view-model';

export function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [viewModel] = useState(() => serviceLocator.get<RegisterViewModel>(DIKeys.REGISTER_VIEW_MODEL));
  const [state, setState] = useState(viewModel.state.getValue());

  useEffect(() => {
    const unsubscribe = viewModel.state.subscribe((newState) => {
      setState(newState);
      if (newState.isRegistered) {
        Alert.alert('Éxito', 'Cuenta creada correctamente');
        // Navigate to home or login
      }
    });

    return unsubscribe;
  }, [viewModel]);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    await viewModel.register(username, email, password);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/logo-placeholder.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Lee y apoya a creadores independientes</Text>

        {/* Tab Buttons */}
        <View style={styles.tabsContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            placeholderTextColor={COLORS.textLight}
            value={username}
            onChangeText={setUsername}
            editable={!state.isLoading}
            autoCapitalize="none"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📧</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.textLight}
            value={email}
            onChangeText={setEmail}
            editable={!state.isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={setPassword}
            editable={!state.isLoading}
            secureTextEntry
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, state.isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#c33',
  },
  errorText: {
    color: '#c33',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textDark,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
});
