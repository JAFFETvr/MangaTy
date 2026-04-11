import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import MonetizationScreen from '@/src/features/creators/presentation/screens/monetization-screen';

export default function MonetizationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MonetizationScreen mangaId={id} />
    </>
  );
}
