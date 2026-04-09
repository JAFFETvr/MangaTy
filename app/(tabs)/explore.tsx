/**
 * ExploreScreen - Explorar mangas por categoría
 */

import { COLORS } from '@/src/core/theme/colors';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { HomeViewModel } from '@/src/features/manga/presentation';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORIES = [
  { id: 'all', label: 'Todas', color: '#E75B8F' },
  { id: 'Romance', label: 'Romance', color: '#FF69B4' },
  { id: 'GL', label: 'GL', color: '#FF6B9D' },
  { id: 'BL', label: 'BL', color: '#FF8A80' },
  { id: 'Drama', label: 'Drama', color: '#BA68C8' },
  { id: 'Fantasía', label: 'Fantasía', color: '#9575CD' },
  { id: 'Acción', label: 'Acción', color: '#EF5350' },
  { id: 'Misterio', label: 'Misterio', color: '#5E35B1' },
  { id: 'Thriller', label: 'Thriller', color: '#455A64' },
  { id: 'Aventura', label: 'Aventura', color: '#00897B' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const viewModel = serviceLocator.get<HomeViewModel>(DIKeys.HOME_VIEW_MODEL);
  const state = useStateFlow(viewModel.state$);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useMVVM(
    async () => {
      await viewModel.loadMangas();
    },
    undefined
  );

  const filteredMangas = state.mangas.filter(manga => {
    const matchesCategory = selectedCategory === 'all' || manga.tags.includes(selectedCategory as any);
    const matchesSearch = searchQuery === '' || 
      manga.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderMangaCard = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.mangaCard}
      onPress={() => router.push({ pathname: '/manga-detail', params: { mangaId: item.id } })}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: item.coverImageUrl }}
          style={styles.mangaCover}
          contentFit="cover"
        />
        {item.isNew && (
          <View style={styles.badgeNew}>
            <Text style={styles.badgeText}>Nuevo</Text>
          </View>
        )}
      </View>
      
      <View style={styles.mangaInfo}>
        <Text style={styles.mangaTitle} numberOfLines={2}>{item.title}</Text>
        
        {/* Author/Creator */}
        {item.author && (
          <Text style={styles.mangaAuthor} numberOfLines={1}>
            por {item.author}
          </Text>
        )}
        
        {/* Rating */}
        <View style={styles.mangaRating}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{item.rating || 'N/A'}</Text>
        </View>

        {/* Chapters count */}
        <View style={styles.mangaMeta}>
          <Ionicons name="book-outline" size={12} color={COLORS.textLight} />
          <Text style={styles.mangaChapters}>{item.chapters} capítulos</Text>
        </View>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag: string, idx: number) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Explorar</Text>
          <Text style={styles.subtitle}>Descubre nuevos mangas</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mangas..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && {
                backgroundColor: item.color,
              },
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item.id && styles.categoryTextActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results */}
      {state.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredMangas.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No se encontraron mangas</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMangas}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={renderMangaCard}
          scrollEnabled
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textDark,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  categoryTextActive: {
    color: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textLight,
    marginTop: 12,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    gap: 8,
  },
  mangaCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  mangaCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  badgeNew: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  mangaInfo: {
    padding: 12,
  },
  mangaTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 18,
    marginBottom: 6,
  },
  mangaAuthor: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  mangaRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  mangaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  mangaChapters: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
