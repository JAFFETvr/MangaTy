/**
 * WalletStatsCard - Shows wallet statistics
 */

import { colors } from '@/src/core/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WalletStats } from '../view-models/WalletViewModel';

interface WalletStatsCardProps {
  stats: WalletStats;
}

export const WalletStatsCard: React.FC<WalletStatsCardProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas</Text>
      <View style={styles.grid}>
        <View style={styles.stat}>
          <Ionicons name="card" size={20} color="#10B981" />
          <Text style={styles.statValue}>{stats.totalPurchased}</Text>
          <Text style={styles.statLabel}>Compradas</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="book" size={20} color={colors.pink} />
          <Text style={styles.statValue}>{stats.totalSpent}</Text>
          <Text style={styles.statLabel}>Gastadas</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="gift" size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.totalRewarded}</Text>
          <Text style={styles.statLabel}>Ganadas</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
});
