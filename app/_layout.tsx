import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
// This import triggers setupDependencies() immediately
import '@/src/di/inject';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            animationEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false,
            animationEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="my-webcomics" 
          options={{ 
            headerShown: false,
            animationEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="create-webcomic" 
          options={{ 
            headerShown: false,
            animationEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="manga-detail" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="coin-store" 
          options={{ 
            presentation: 'modal',
            title: 'Tienda de Monedas',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="wallet" 
          options={{ 
            presentation: 'card',
            title: 'Mi Wallet',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="creators" 
          options={{ 
            presentation: 'card',
            title: 'Creadores',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="creator-dashboard" 
          options={{ 
            presentation: 'card',
            title: 'Dashboard',
            headerShown: false,
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
