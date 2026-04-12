import React from 'react';
import { Stack } from 'expo-router';
import MyWebcomicsScreen from '@/src/features/creators/presentation/screens/my-webcomics-screen';

export default function MyWebcomicsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MyWebcomicsScreen />
    </>
  );
}
