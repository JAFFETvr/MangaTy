/**
 * BottomNav Component - Bottom navigation with 3 tabs
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type BottomNavTab = 'home' | 'favorites' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
}

const TAB_ITEMS = [
  { key: 'home' as const, label: 'Inicio', icon: '🏠' },
  { key: 'favorites' as const, label: 'Favoritos', icon: '⭐' },
  { key: 'profile' as const, label: 'Perfil', icon: '👤' },
];

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 16,
    paddingTop: 10,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  tabIcon: {
    fontSize: 24,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  activeLabel: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.pink,
  },
  inactiveLabel: {
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textMuted,
  },
});

export function BottomNav({
  activeTab,
  onTabChange,
}: BottomNavProps): React.ReactElement {
  return (
    <View style={styles.container}>
      {TAB_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tabButton}
            onPress={() => onTabChange(item.key)}
          >
            <Text style={styles.tabIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.activeLabel : styles.inactiveLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
