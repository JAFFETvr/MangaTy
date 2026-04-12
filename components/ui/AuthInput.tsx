import { Colors } from '@/constants/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
}

export function AuthInput({ icon, secureTextEntry = false, ...props }: AuthInputProps) {
  const theme = Colors.light;

  const [isSecure, setIsSecure] = React.useState(secureTextEntry === true);

  return (
    <View style={[styles.container, { backgroundColor: theme.authInputBg }]}>
      {icon && (
        <Feather name={icon} size={20} color={theme.icon} style={styles.icon} />
      )}
      <TextInput
        style={[styles.input, { color: theme.authInputText }]}
        placeholderTextColor={theme.icon}
        secureTextEntry={isSecure}
        {...props}
      />
      {secureTextEntry === true && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.eyeIcon} activeOpacity={0.7}>
          <Feather name={isSecure ? "eye-off" : "eye"} size={20} color={theme.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 5,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
  },
});
