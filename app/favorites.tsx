import React from 'react';
import FavoritesScreen from '@/src/features/favorites/presentation/screens/favorites-screen';
import { Stack } from 'expo-router';

export default function FavoritesPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FavoritesScreen />
    </>
  );
}
