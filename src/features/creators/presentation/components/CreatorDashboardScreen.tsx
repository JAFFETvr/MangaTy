/**
 * CreatorDashboardScreen - Creator earnings dashboard
 */

import { colors } from '@/src/core/theme';
import { EarningsDashboard, EarningsList } from '@/src/features/earnings/presentation/components';
import { EarningsViewModel } from '@/src/features/earnings/presentation/view-models';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MOCK_CREATOR_ID = 'creator-1';
const MINIMUM_PAYOUT = 100;

export const CreatorDashboardScreen: React.FC = () => {
  const [viewModel] = useState(() => new EarningsViewModel());
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadEarningsData(MOCK_CREATOR_ID);
    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    viewModel.loadEarningsData(MOCK_CREATOR_ID);
  };

  if (state.isLoading && !state.summary) {
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
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Creador</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={22} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={state.isLoading} onRefresh={handleRefresh} />
        }
      >
        {state.summary && (
          <EarningsDashboard
            summary={state.summary}
            progressToMinimum={viewModel.getProgressToMinimumPayout()}
            canRequestPayout={viewModel.canRequestPayout()}
            minimumPayout={MINIMUM_PAYOUT}
            isLoading={state.isLoading}
            onRefresh={handleRefresh}
          />
        )}

        <View style={styles.listSection}>
          <EarningsList earnings={state.earnings} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  settingsButton: {
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
});

export default CreatorDashboardScreen;
