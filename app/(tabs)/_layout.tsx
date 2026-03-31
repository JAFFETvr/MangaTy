import { COLORS } from '@/src/core/theme';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.pink,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: '#fff',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> as any,
          tabBarLabel: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⭐</Text> as any,
          tabBarLabel: 'Favoritos',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> as any,
          tabBarLabel: 'Perfil',
        }}
      />
    </Tabs>
  );
}

import { Text } from 'react-native';

