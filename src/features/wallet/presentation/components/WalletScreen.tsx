/**
 * WalletScreen - User wallet and transaction history
 */

import { colors } from '@/src/core/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { TransactionList, WalletHeader, WalletStatsCard } from '../components';
import { WalletViewModel } from '../view-models';

const MOCK_USER_ID = 'user-1';

export const WalletScreen: React.FC = () => {
  const router = useRouter();
  const [viewModel] = useState(() => new WalletViewModel());
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadWalletData(MOCK_USER_ID);
    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    viewModel.refresh(MOCK_USER_ID);
  };

  const handleBuyCoins = () => {
    router.push('/coins-store');
  };

  if (state.isLoading && state.transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.pink} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={state.isLoading} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>Mi Wallet</Text>
        
        <WalletHeader balance={state.balance} onBuyCoins={handleBuyCoins} />
        
        {state.stats && <WalletStatsCard stats={state.stats} />}
        
        <View style={styles.transactions}>
          <TransactionList transactions={state.transactions} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactions: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});

export default WalletScreen;
