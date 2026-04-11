import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import ChapterViewerScreen from '@/src/features/creators/presentation/screens/chapter-viewer-screen';

export default function ChapterViewerRoute() {
  const { id, chapterId } = useLocalSearchParams<{ id: string; chapterId: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChapterViewerScreen mangaId={id} chapterId={chapterId} />
    </>
  );
}
