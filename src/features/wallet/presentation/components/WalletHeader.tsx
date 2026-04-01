/**
 * WalletHeader - Shows current balance with buy button
 */

import { colors } from '@/src/core/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WalletHeaderProps {
  balance: number;
  onBuyCoins: () => void;
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({ balance, onBuyCoins }) => {
  return (
    <View style={styles.container}>
      <View style={styles.balanceSection}>
        <Text style={styles.label}>Tu Balance</Text>
        <View style={styles.balanceRow}>
          <Ionicons name="logo-bitcoin" size={28} color="#F5C518" />
          <Text style={styles.balance}>{balance.toLocaleString()}</Text>
          <Text style={styles.coins}>monedas</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.buyButton} onPress={onBuyCoins}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.buyText}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.pink,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
  },
  balanceSection: {},
  label: {
    color: '#FFD6EC',
    fontSize: 13,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balance: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  coins: {
    color: '#FFD6EC',
    fontSize: 14,
  },
  buyButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  buyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
