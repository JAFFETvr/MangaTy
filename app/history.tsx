import React from 'react';
import HistoryScreen from '@/src/features/history/presentation/screens/history-screen';
import { Stack } from 'expo-router';

export default function HistoryPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HistoryScreen />
    </>
  );
}
