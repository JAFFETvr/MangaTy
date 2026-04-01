/**
 * EarningsDashboard - Complete earnings overview for creators
 */

import { colors } from '@/src/core/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { EarningsSummary } from '../view-models/EarningsViewModel';

interface EarningsDashboardProps {
  summary: EarningsSummary;
  progressToMinimum: number;
  canRequestPayout: boolean;
  minimumPayout: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  summary,
  progressToMinimum,
  canRequestPayout,
  minimumPayout,
  isLoading,
  onRefresh,
}) => {
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Header Card - Pending Balance */}
      <View style={styles.mainCard}>
        <Text style={styles.mainCardLabel}>Balance Disponible</Text>
        <Text style={styles.mainCardAmount}>${summary.pendingBalance.toFixed(2)} MXN</Text>
        
        {/* Progress to minimum payout */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressToMinimum}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {canRequestPayout 
              ? '✓ Listo para retirar'
              : `${progressToMinimum.toFixed(0)}% de $${minimumPayout} MXN mínimo`
            }
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="today" size={20} color={colors.pink} />
          <Text style={styles.statAmount}>${summary.todayEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Hoy</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={20} color={colors.pink} />
          <Text style={styles.statAmount}>${summary.weekEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Esta Semana</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={20} color={colors.pink} />
          <Text style={styles.statAmount}>${summary.monthEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Este Mes</Text>
        </View>
      </View>

      {/* Total Earned Card */}
      <View style={styles.totalCard}>
        <View style={styles.totalLeft}>
          <Ionicons name="wallet" size={24} color="#10B981" />
          <View style={styles.totalText}>
            <Text style={styles.totalLabel}>Total Ganado (Histórico)</Text>
            <Text style={styles.totalAmount}>${summary.totalEarned.toFixed(2)} MXN</Text>
          </View>
        </View>
        <View style={styles.transactionCount}>
          <Text style={styles.transactionNumber}>{summary.totalTransactions}</Text>
          <Text style={styles.transactionLabel}>ventas</Text>
        </View>
      </View>

      {/* Revenue Split Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color="#888" />
        <Text style={styles.infoText}>
          Recibes el 80% de cada venta. El 20% va a la plataforma.
          El mínimo de retiro es ${minimumPayout} MXN.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  mainCard: {
    backgroundColor: colors.pink,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  mainCardLabel: {
    color: '#FFD6EC',
    fontSize: 14,
    marginBottom: 4,
  },
  mainCardAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  totalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    marginLeft: 12,
  },
  totalLabel: {
    fontSize: 12,
    color: '#888',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  transactionCount: {
    alignItems: 'center',
  },
  transactionNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  transactionLabel: {
    fontSize: 11,
    color: '#888',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
});
