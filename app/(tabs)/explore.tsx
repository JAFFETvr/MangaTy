/**
 * ExploreScreen - Explorar mangas y creadores
 */

import { COLORS } from '@/src/core/theme';
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

const categories = [
  { id: 'all', label: 'Todo', icon: 'apps' },
  { id: 'Romance', label: 'Romance', icon: 'heart' },
  { id: 'Acción', label: 'Acción', icon: 'flash' },
  { id: 'Fantasía', label: 'Fantasía', icon: 'sparkles' },
  { id: 'Drama', label: 'Drama', icon: 'sad' },
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <TouchableOpacity 
          style={styles.creatorsButton}
          onPress={() => router.push('/creators')}
        >
          <Ionicons name="people" size={18} color="#fff" />
          <Text style={styles.creatorsButtonText}>Creadores</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mangas..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Ionicons 
              name={item.icon as any} 
              size={16} 
              color={selectedCategory === item.id ? '#fff' : COLORS.textMuted} 
            />
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
          <ActivityIndicator size="large" color={COLORS.pink} />
        </View>
      ) : (
        <FlatList
          data={filteredMangas}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.mangaCard}
              onPress={() => router.push({ pathname: '/manga-detail', params: { mangaId: item.id } })}
            >
              <Image
                source={{ uri: item.cover }}
                style={styles.mangaCover}
                contentFit="cover"
              />
              <View style={styles.mangaInfo}>
                <Text style={styles.mangaTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.mangaMeta}>
                  <Ionicons name="book-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.mangaChapters}>{item.chapters} caps</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No se encontraron mangas</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  creatorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pink,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  creatorsButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.pink,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  categoryTextActive: {
    color: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  mangaCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mangaCover: {
    width: '100%',
    height: 180,
  },
  mangaInfo: {
    padding: 10,
  },
  mangaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 18,
  },
  mangaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  mangaChapters: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 12,
  },
});
