/**
 * FavoritesScreen - Tab 2 - Favoritos
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { FavoritesViewModel } from '@/src/features/favorites/presentation';
import { MangaCard } from '@/src/features/manga/presentation/components';
import { BottomNav } from '@/src/shared/components';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.pink,
    paddingVertical: 32,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.black,
    fontSize: TYPOGRAPHY.sizes['2xl'],
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.border,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    fontSize: 36,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 8,
    paddingBottom: 90,
    paddingTop: 16,
  },
});

export default function FavoritesScreen() {
  const router = useRouter();
  const viewModel = serviceLocator.get<FavoritesViewModel>(DIKeys.FAVORITES_VIEW_MODEL);
  const state = useStateFlow(viewModel.state$);

  useMVVM(
    async () => {
      await viewModel.loadFavorites();
    },
    undefined
  );

  const handleMangaPress = (mangaId: number) => {
    router.push({
      pathname: '/manga-detail',
      params: { mangaId },
    } as any);
  };

  const isEmpty = !state.isLoading && state.favorites.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 36 }}>⭐</Text>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <Text style={styles.headerSubtitle}>{state.favorites.length} manga(s) guardado(s)</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={{ fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.text, marginBottom: 10 }}>
            No tienes favoritos
          </Text>
          <Text style={styles.emptyText}>
            Explora mangas y agrégalos a favoritos para verlos aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={state.favorites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MangaCard manga={item} onPress={() => handleMangaPress(item.id)} />
            </View>
          )}
          contentContainerStyle={styles.content}
          scrollEnabled={true}
        />
      )}

      <BottomNav activeTab="favorites" onTabChange={() => {}} />
    </View>
  );
}
