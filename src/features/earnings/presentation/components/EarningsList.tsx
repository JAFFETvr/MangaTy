/**
 * EarningsList - List of all earning transactions
 */

import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CreatorEarnings } from '../../domain/entities';
import { EarningItem } from './EarningItem';

interface EarningsListProps {
  earnings: CreatorEarnings[];
}

export const EarningsList: React.FC<EarningsListProps> = ({ earnings }) => {
  if (earnings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No hay ganancias aún</Text>
        <Text style={styles.emptySubtext}>Cuando alguien compre un capítulo, aparecerá aquí</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de Ventas</Text>
      <FlatList
        data={earnings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EarningItem earning={item} />}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center',
  },
});
