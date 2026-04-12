import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ManageWebcomicScreen from '@/src/features/creators/presentation/screens/manage-webcomic-screen';
import { Stack } from 'expo-router';

export default function ManageWebcomicRoute() {
  const { id, slug } = useLocalSearchParams<{ id: string; slug?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ManageWebcomicScreen 
        mangaId={id} 
        slug={slug || `manga-${id}`} // Fallback for mock items
      />
    </>
  );
}
