/**
 * TopBar Component - Header bar with logo, coin badge, and menu button
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { APP_NAME, APP_SUBTITLE } from '@/src/shared/utils/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from './icon-button';

interface TopBarProps {
  coinBalance: number;
  onMenuPress: () => void;
  onBellPress: () => void;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.pink,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  appName: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.black,
    fontSize: TYPOGRAPHY.sizes['3xl'],
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinBadge: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: '#333',
  },
});

export function TopBar({
  coinBalance,
  onMenuPress,
  onBellPress,
}: TopBarProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>{APP_SUBTITLE}</Text>
      </View>
      <View style={styles.topRight}>
        <View style={styles.coinBadge}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>💰</Text>
          <Text style={{ color: '#333', fontWeight: TYPOGRAPHY.weights.extrabold }}>
            {coinBalance}
          </Text>
        </View>
        <IconButton
          icon={<Text style={{ fontSize: 20 }}>🔔</Text>}
          onPress={onBellPress}
        />
        <IconButton
          icon={<Text style={{ fontSize: 20 }}>☰</Text>}
          onPress={onMenuPress}
        />
      </View>
    </View>
  );
}
