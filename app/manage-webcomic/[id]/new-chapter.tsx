import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import CreateChapterScreen from '@/src/features/creators/presentation/screens/create-chapter-screen';

export default function NewChapterRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CreateChapterScreen mangaId={id} />
    </>
  );
}
