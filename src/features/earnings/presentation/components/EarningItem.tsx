/**
 * EarningItem - Single earning transaction row
 */

import { colors } from '@/src/core/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CreatorEarnings } from '../../domain/entities';

interface EarningItemProps {
  earning: CreatorEarnings;
}

export const EarningItem: React.FC<EarningItemProps> = ({ earning }) => {
  const formattedDate = new Date(earning.timestamp).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="book" size={18} color={colors.pink} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>Capítulo {earning.chapterNumber}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <View style={styles.amounts}>
        <Text style={styles.amount}>+${earning.creatorRevenue.toFixed(2)}</Text>
        <Text style={styles.coins}>{earning.coinsEarned} 🪙</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD6EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
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
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  coins: {
    fontSize: 12,
    color: '#888',
  },
});
