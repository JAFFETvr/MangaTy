/**
 * TransactionList - List of wallet transactions with filter
 */

import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WalletTransaction } from '../../domain/entities';
import { TransactionItem } from './TransactionItem';

type FilterType = 'all' | 'buy' | 'spend' | 'reward';

interface TransactionListProps {
  transactions: WalletTransaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'buy', label: 'Compras' },
    { key: 'spend', label: 'Gastos' },
    { key: 'reward', label: 'Premios' },
  ];

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No hay transacciones</Text>
        <Text style={styles.emptySubtext}>Compra monedas o gana recompensas para comenzar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterButton, filter === f.key && styles.filterActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  filterActive: {
    backgroundColor: '#FFD6EC',
  },
  filterText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FF6B9D',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
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
