import React from 'react';
import { Stack } from 'expo-router';
import CreateWebcomicScreen from '@/src/features/creators/presentation/screens/create-webcomic-screen';

export default function CreateWebcomicRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CreateWebcomicScreen />
    </>
  );
}
