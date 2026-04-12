import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ExploreCategoryScreen from '@/src/features/explore/presentation/screens/explore-category-screen';
import { Stack } from 'expo-router';

export default function GenrePage() {
  const { genre } = useLocalSearchParams<{ genre: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ExploreCategoryScreen genre={genre || ''} />
    </>
  );
}
