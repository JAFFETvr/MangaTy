import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import EditInfoScreen from '@/src/features/creators/presentation/screens/edit-info-screen';

export default function EditInfoRoute() {
  const { id, slug } = useLocalSearchParams<{ id: string; slug?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EditInfoScreen 
        mangaId={id} 
        slug={slug || `manga-${id}`} 
      />
    </>
  );
}
