/**
 * HomeScreen - Tab 1 - Rediseñada con carousel y categorías
 */

import { COLORS } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { HomeViewModel } from '@/src/features/manga/presentation';
import { MangaCard } from '@/src/features/manga/presentation/components';
import { SearchBar, TopBar } from '@/src/shared/components';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { TYPOGRAPHY } from '@/src/core/theme/typography';

const CATEGORIES = [
  { id: 1, name: 'Romance', color: '#FF69B4' },
  { id: 2, name: 'GL', color: '#FF6B9D' },
  { id: 3, name: 'BL', color: '#FF8A80' },
  { id: 4, name: 'Drama', color: '#BA68C8' },
  { id: 5, name: 'Fantasía', color: '#9575CD' },
  { id: 6, name: 'Acción', color: '#EF5350' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  carouselContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  carouselCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 200,
  },
  carouselImage: {
    width: '100%',
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  carouselInfo: {
    height: '20%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  carouselTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  carouselRating: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
  },
  categorySection: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  viewMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },
  viewMoreText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  mangaGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  mangaItem: {
    width: '30%',
    aspectRatio: 0.7,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#B71C1C',
    textAlign: 'center',
    marginTop: 20,
  },
});

interface MangasByCategory {
  [key: string]: any[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const viewModel = serviceLocator.get<HomeViewModel>(DIKeys.HOME_VIEW_MODEL);
  const state = useStateFlow(viewModel.state$);

  useMVVM(
    async () => {
      await viewModel.loadMangas();
    },
    undefined
  );

  const handleMangaPress = (mangaId: number) => {
    router.push({
      pathname: '/manga-detail',
      params: { mangaId },
    } as any);
  };

  const handleSearch = async (query: string) => {
    await viewModel.search(query);
  };

  const handleCategoryViewMore = (categoryName: string) => {
    router.push({
      pathname: '/explore',
      params: { category: categoryName },
    } as any);
  };

  if (state.isLoading && state.filteredMangas.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar coinBalance={50} onMenuPress={() => setMenuOpen(true)} onBellPress={() => {}} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  // Agrupar mangas por categoría
  const mangasByCategory: MangasByCategory = {};
  CATEGORIES.forEach((cat) => {
    mangasByCategory[cat.name] = state.filteredMangas.slice(0, 3);
  });

  const featuredManga = state.filteredMangas[0];

  return (
    <View style={styles.container}>
      <TopBar coinBalance={50} onMenuPress={() => setMenuOpen(true)} onBellPress={() => {}} />

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mangaty</Text>
        </View>

        {/* Carousel Destacado */}
        {featuredManga && (
          <TouchableOpacity 
            style={styles.carouselContainer}
            onPress={() => handleMangaPress(featuredManga.id)}
          >
            <View style={styles.carouselCard}>
              <Image
                source={{ uri: featuredManga.coverImageUrl }}
                style={styles.carouselImage}
              />
              <View style={styles.carouselInfo}>
                <Text style={styles.carouselTitle} numberOfLines={1}>
                  {featuredManga.title}
                </Text>
                <Text style={styles.carouselRating}>⭐ {featuredManga.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Secciones por Categoría */}
        {CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryTitle, { color: category.color }]}>
                {category.name}
              </Text>
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => handleCategoryViewMore(category.name)}
              >
                <Text style={styles.viewMoreText}>Ver más</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={mangasByCategory[category.name]}
              keyExtractor={(item) => `${category.name}-${item.id}`}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mangaGrid}
              renderItem={({ item }) => (
                <View style={styles.mangaItem}>
                  <MangaCard 
                    manga={item} 
                    onPress={() => handleMangaPress(item.id)}
                  />
                </View>
              )}
            />
          </View>
        ))}
      </ScrollView>

      {state.error && <Text style={styles.error}>{state.error}</Text>}
    </View>
  );
}

