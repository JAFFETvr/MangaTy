import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import FreeChaptersScreen from '@/src/features/creators/presentation/screens/free-chapters-screen';

export default function FreeChaptersRoute() {
  const { id, slug } = useLocalSearchParams<{ id: string; slug?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FreeChaptersScreen 
        mangaId={id} 
        slug={slug || `manga-${id}`} 
      />
    </>
  );
}
