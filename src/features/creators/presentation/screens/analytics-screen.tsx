import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { AnalyticsViewModel } from '../view-models/analytics-view-model';

interface Props {
  slug: string;
  mangaId: string;
}

export default function AnalyticsScreen({ slug, mangaId }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<AnalyticsViewModel>(() =>
    serviceLocator.get(DIKeys.ANALYTICS_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadAnalytics(slug, mangaId);
    return unsubscribe;
  }, [slug, mangaId]);

  const statCards = [
    { label: 'Vistas totales', value: state.totalViews.toLocaleString(), growth: state.growth.views, icon: 'eye' },
    { label: 'Seguidores', value: state.followers.toLocaleString(), growth: state.growth.followers, icon: 'users' },
    { label: 'Me gusta', value: state.likes.toLocaleString(), growth: state.growth.likes, icon: 'heart' },
    { label: 'Ingresos', value: `$${state.income}`, growth: state.growth.income, icon: 'dollar-sign' },
  ];

  if (state.isLoading && !state.manga) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D8708E" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Analíticas</Text>
          <Text style={styles.headerSubtitle}>{state.manga?.title || 'holaa'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((card, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Feather name={card.icon as any} size={16} color="#D8708E" />
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statGrowth}>{card.growth} vs anterior</Text>
            </View>
          ))}
        </View>

        {/* Popular Chapters */}
        <Text style={styles.sectionTitle}>Capítulos más populares</Text>
        
        <View style={styles.popularList}>
          {state.popularChapters.length > 0 ? (
            state.popularChapters.map((cap, i) => (
              <View key={cap.id} style={styles.popularItem}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularTitle}>Cap. {cap.number}</Text>
                  <View style={styles.popularStats}>
                    <Feather name="eye" size={12} color="#999" />
                    <Text style={styles.popularStatText}>{cap.views} vistas</Text>
                    <Text style={styles.popularStatText}>$ ${cap.earnings}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyView}>
              <Feather name="bar-chart-2" size={40} color="#FEEBED" />
              <Text style={styles.emptyText}>Aún no hay datos de capítulos</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  scrollContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEEBED',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  statGrowth: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  popularList: {
    gap: 12,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#D8708E',
    fontWeight: 'bold',
  },
  popularInfo: {
    flex: 1,
  },
  popularTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  popularStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  popularStatText: {
    fontSize: 12,
    color: '#999',
  },
  emptyView: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEEBED',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#D1A2AC',
    fontWeight: '500',
  },
});
