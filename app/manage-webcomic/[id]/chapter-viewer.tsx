import ChapterViewerScreen from '@/src/features/creators/presentation/screens/chapter-viewer-screen';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ChapterViewerRoute() {
  const { id, chapterId } = useLocalSearchParams<{ id: string; chapterId: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChapterViewerScreen mangaId={id} chapterId={chapterId} />
    </>
  );
}
