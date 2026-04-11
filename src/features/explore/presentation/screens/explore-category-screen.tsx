import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { ExploreCategoryViewModel, SortType } from '../view-models/explore-category-view-model';
import { buildCoverUrl } from '@/src/core/api/api-config';
import { Manga } from '@/src/features/manga/domain/entities';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

interface Props {
  genre: string;
}

export default function ExploreCategoryScreen({ genre }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<ExploreCategoryViewModel>(() =>
    serviceLocator.get(DIKeys.EXPLORE_CATEGORY_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadMangas(genre);
    return unsubscribe;
  }, [viewModel, genre]);

  const renderFilterButton = (label: string, type: SortType) => (
    <TouchableOpacity 
      style={[styles.filterButton, state.currentSort === type && styles.activeFilter]}
      onPress={() => viewModel.setSort(type)}
    >
      <Text style={[styles.filterText, state.currentSort === type && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: Manga }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => router.push({ pathname: '/webcomic/[slug]', params: { slug: item.slug, mangaId: item.id } })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.coverImagePath ? buildCoverUrl(item.coverImagePath) : 'https://via.placeholder.com/150' }} 
          style={styles.gridImage} 
        />
        <View style={styles.heartBadge}>
          <Feather name="heart" size={10} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.ratingText}>4.8</Text> 
        </View>
      </View>
      <Text style={styles.mangaTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.mangaAuthor}>{item.creatorName || 'Autor desconocido'}</Text>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Manga }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => router.push({ pathname: '/webcomic/[slug]', params: { slug: item.slug, mangaId: item.id } })}
    >
      <Image 
        source={{ uri: item.coverImagePath ? buildCoverUrl(item.coverImagePath) : 'https://via.placeholder.com/150' }} 
        style={styles.listImage} 
      />
      <View style={styles.listContent}>
        <Text style={styles.mangaTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.mangaAuthor}>{item.creatorName || 'Autor desconocido'}</Text>
        <View style={styles.listFooter}>
          <View style={styles.ratingBadgeSmall}>
            <Feather name="heart" size={10} color="#D8708E" fill="#D8708E" />
            <Text style={styles.ratingTextSmall}>4.8</Text>
          </View>
          <Text style={styles.viewsText}>{item.viewsCount} lecturas</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{genre}</Text>
          <Text style={styles.mangaCount}>{state.mangas.length} mangas</Text>
        </View>

        <View style={styles.viewToggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewType === 'grid' && styles.activeToggle]} 
            onPress={() => setViewType('grid')}
          >
            <Feather name="grid" size={18} color={viewType === 'grid' ? "#D8708E" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewType === 'list' && styles.activeToggle]} 
            onPress={() => setViewType('list')}
          >
            <Feather name="list" size={18} color={viewType === 'list' ? "#D8708E" : "#999"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { label: 'Popular', type: 'popular' as SortType },
            { label: 'Reciente', type: 'recent' as SortType },
            { label: 'Más visto', type: 'views' as SortType },
            { label: 'A-Z', type: 'az' as SortType },
          ]}
          keyExtractor={(item) => item.type}
          renderItem={({ item }) => renderFilterButton(item.label, item.type)}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      <View style={styles.divider} />

      {state.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D8708E" />
        </View>
      ) : (
        <FlatList
          data={state.mangas}
          key={viewType}
          numColumns={viewType === 'grid' ? COLUMN_COUNT : 1}
          renderItem={viewType === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay webcomics en esta categoría todavía.</Text>
            </View>
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  mangaCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 6,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersWrapper: {
    height: 50,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  activeFilter: {
    borderColor: '#D8708E',
    backgroundColor: '#FDF5F7',
  },
  filterText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#D8708E',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  listPadding: {
    padding: 16,
  },
  gridItem: {
    flex: 1,
    margin: 8,
  },
  imageContainer: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  heartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mangaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  mangaAuthor: {
    fontSize: 12,
    color: '#999',
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  listImage: {
    width: 80,
    height: 110,
    borderRadius: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  ratingBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  viewsText: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
