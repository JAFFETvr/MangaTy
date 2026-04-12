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
import { FavoritesViewModel } from '../view-models/favorites-view-model';
import { buildCoverUrl } from '@/src/core/api/api-config';
import { Manga } from '@/src/features/manga/domain/entities';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<FavoritesViewModel>(() =>
    serviceLocator.get(DIKeys.FAVORITES_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'az'>('recent');

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadFavorites();
    return unsubscribe;
  }, [viewModel]);

  const favorites = [...state.favorites].sort((a, b) => {
    if (sortBy === 'recent') {
      // Assuming ID or creation date if available, for now just keeping order
      return 0; 
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Feather name="heart" size={48} color="#E0C4CC" />
      </View>
      <Text style={styles.emptyTitle}>Sin favoritos</Text>
      <Text style={styles.emptySubtitle}>Aun no tienes favoritos</Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.exploreButtonText}>Explorar Webcomics</Text>
      </TouchableOpacity>
    </View>
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
          <Feather name="heart" size={16} color="#FFFFFF" fill="#FFFFFF" />
        </View>
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={10} color="#FFD700" />
          <Text style={styles.ratingText}>4.5</Text> 
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
        <View style={styles.listHeaderRow}>
          <Text style={styles.mangaTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity onPress={() => viewModel.toggleFavorite(item)}>
            <Feather name="heart" size={18} color="#D8708E" fill="#D8708E" />
          </TouchableOpacity>
        </View>
        <Text style={styles.mangaAuthor}>{item.creatorName || 'Autor desconocido'}</Text>
        <View style={styles.listFooterRow}>
          <View style={styles.ratingBadgeSmall}>
            <FontAwesome name="star" size={10} color="#FFD700" />
            <Text style={styles.ratingTextSmall}>4.5</Text>
          </View>
          <Text style={styles.tagText}>{item.genre || 'Webcomic'}</Text>
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
          <View style={styles.headerTopRow}>
            <Feather name="heart" size={20} color="#D8708E" style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>Mis favoritos</Text>
          </View>
          <Text style={styles.mangaCount}>{favorites.length} mangas</Text>
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
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, sortBy === 'recent' && styles.activeFilter]}
          onPress={() => setSortBy('recent')}
        >
          <Text style={[styles.filterText, sortBy === 'recent' && styles.activeFilterText]}>Reciente</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, sortBy === 'az' && styles.activeFilter]}
          onPress={() => setSortBy('az')}
        >
          <Text style={[styles.filterText, sortBy === 'az' && styles.activeFilterText]}>A-Z</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {state.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D8708E" />
        </View>
      ) : favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          key={viewType}
          numColumns={viewType === 'grid' ? COLUMN_COUNT : 1}
          renderItem={viewType === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  mangaCount: {
    fontSize: 14,
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FDF5F7',
    borderWidth: 1,
    borderColor: '#F6E9EB',
  },
  activeFilter: {
    borderColor: '#D8708E',
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#D8708E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
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
    elevation: 3,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mangaTitle: {
    fontSize: 15,
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
    width: 90,
    height: 120,
    borderRadius: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  ratingBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingTextSmall: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  tagText: {
    fontSize: 11,
    color: '#D8708E',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDF5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#D8708E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
