import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { HistoryViewModel } from '../view-models/history-view-model';
import { buildCoverUrl } from '@/src/core/api/api-config';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<HistoryViewModel>(() =>
    serviceLocator.get(DIKeys.HISTORY_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'az'>('recent');

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadHistory();
    return unsubscribe;
  }, [viewModel]);

  const history = [...state.history].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return a.manga.title.localeCompare(b.manga.title);
    }
  });

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Hace poco';
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Hace ${diffDays}d`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Feather name="book-open" size={48} color="#E0C4CC" />
      </View>
      <Text style={styles.emptyTitle}>Historial vacío</Text>
      <Text style={styles.emptySubtitle}>Aun no has leido ningun manga</Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.exploreButtonText}>Explorar Webcomics</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => router.push({ pathname: '/webcomic/[slug]', params: { slug: item.manga.slug, mangaId: item.manga.id } })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.manga.coverImagePath ? buildCoverUrl(item.manga.coverImagePath) : 'https://via.placeholder.com/150' }} 
          style={styles.gridImage} 
        />
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>{formatRelativeTime(item.timestamp)}</Text>
        </View>
      </View>
      <Text style={styles.mangaTitle} numberOfLines={1}>{item.manga.title}</Text>
      <Text style={styles.mangaChapter}>Cap. {item.chapterNumber}</Text>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => router.push({ pathname: '/webcomic/[slug]', params: { slug: item.manga.slug, mangaId: item.manga.id } })}
    >
      <Image 
        source={{ uri: item.manga.coverImagePath ? buildCoverUrl(item.manga.coverImagePath) : 'https://via.placeholder.com/150' }} 
        style={styles.listImage} 
      />
      <View style={styles.listContent}>
        <Text style={styles.mangaTitle} numberOfLines={1}>{item.manga.title}</Text>
        <Text style={styles.mangaAuthor}>{item.manga.creatorName || 'Autor desconocido'}</Text>
        
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>Capítulo {item.chapterNumber}</Text>
          <Text style={styles.progressPercentage}>{item.progress}%</Text>
        </View>
        
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
        </View>
        
        <View style={styles.timeRow}>
          <Feather name="clock" size={12} color="#999" />
          <Text style={styles.timeText}>Leído hace {formatRelativeTime(item.timestamp)}</Text>
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
            <Feather name="clock" size={20} color="#D8708E" style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>Historial de lectura</Text>
          </View>
          <Text style={styles.mangaCount}>{history.length} mangas</Text>
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
      ) : history.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={history}
          key={viewType} // Force re-render when switching views
          numColumns={viewType === 'grid' ? COLUMN_COUNT : 1}
          renderItem={viewType === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.manga.id.toString()}
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
  timeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  mangaTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  mangaChapter: {
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
  mangaAuthor: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#D8708E',
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D8708E',
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
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
