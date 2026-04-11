import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import AnalyticsScreen from '@/src/features/creators/presentation/screens/analytics-screen';

export default function AnalyticsRoute() {
  const { id, slug } = useLocalSearchParams<{ id: string; slug?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AnalyticsScreen 
        mangaId={id} 
        slug={slug || `manga-${id}`} 
      />
    </>
  );
}
