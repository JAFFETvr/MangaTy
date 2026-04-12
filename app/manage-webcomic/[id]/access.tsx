import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import AccessConfigScreen from '@/src/features/creators/presentation/screens/access-config-screen';

export default function AccessConfigRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AccessConfigScreen mangaId={id} />
    </>
  );
}
