/**
 * TransactionItem - Single wallet transaction row
 */

import { colors } from '@/src/core/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WalletTransaction } from '../../domain/entities';

interface TransactionItemProps {
  transaction: WalletTransaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getIcon = (): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    switch (transaction.type) {
      case 'buy':
        return { name: 'card', color: '#10B981', bg: '#D1FAE5' };
      case 'spend':
        return { name: 'book', color: colors.pink, bg: '#FFD6EC' };
      case 'reward':
        return { name: 'gift', color: '#F59E0B', bg: '#FEF3C7' };
    }
  };

  const getLabel = (): string => {
    switch (transaction.type) {
      case 'buy':
        return `Compra de ${transaction.coins} monedas`;
      case 'spend':
        return `Capítulo ${transaction.metadata?.chapterNumber || 'N/A'}`;
      case 'reward':
        return 'Recompensa';
    }
  };

  const icon = getIcon();
  const isPositive = transaction.type !== 'spend';

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={18} color={icon.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{getLabel()}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <View style={styles.amounts}>
        <Text style={[styles.coins, isPositive ? styles.positive : styles.negative]}>
          {isPositive ? '+' : '-'}{transaction.coins}
        </Text>
        {transaction.amountMXN > 0 && (
          <Text style={styles.mxn}>${transaction.amountMXN.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  amounts: {
    alignItems: 'flex-end',
  },
  coins: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: colors.pink,
  },
  mxn: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
});
