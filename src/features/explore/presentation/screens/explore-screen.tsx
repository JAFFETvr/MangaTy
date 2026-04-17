import { Colors } from '@/constants/theme';
import { buildCoverUrl } from '@/src/core/api/api-config';
import { loadPublicWebcomics } from '@/src/core/storage/local-webcomic-storage';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { MangaRemoteDataSource } from '@/src/features/manga/data/datasources/manga-remote-datasource';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const PADDING_HORIZONTAL = 16;
const CARD_WIDTH = (width - PADDING_HORIZONTAL * 2 - CARD_MARGIN) / 2;

// Géneros que siempre se mostrarán
const GENRE_LABELS = [
  { id: '1', title: 'Drama', image: 'https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=400&q=80' },
  { id: '2', title: 'Romance', image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&q=80' },
  { id: '3', title: 'GL', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80' },
  { id: '4', title: 'BL', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80' },
  { id: '5', title: 'Acción', image: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?w=400&q=80' },
  { id: '6', title: 'Comedia', image: 'https://images.unsplash.com/photo-1513628253939-010e64bc66d7?w=400&q=80' },
  { id: '7', title: 'Fantasía', image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80' },
  { id: '8', title: 'Misterio', image: 'https://images.unsplash.com/photo-1505806616949-1e87b487cb2a?w=400&q=80' },
  { id: '9', title: 'Omegaverse', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80' },
  { id: '10', title: 'Historical', image: 'https://images.unsplash.com/photo-1551221375-1a3b98c56fa2?w=400&q=80' },
  { id: '11', title: 'Horror', image: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?w=400&q=80' },
  { id: '12', title: 'Informativo', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80' },
  { id: '13', title: 'Sobrenatural', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80' },
  { id: '14', title: 'Superhero', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80' },
  { id: '15', title: 'Vida Cotidiana', image: 'https://images.unsplash.com/photo-1490750967868-88cb4ecb07cb?w=400&q=80' },
];

interface MangaItem {
  id: string;
  title: string;
  slug: string;
  coverImagePath: string | null;
  genre: string;
  creatorName: string;
  isLocal?: boolean;
}

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const theme = Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<typeof GENRE_LABELS>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [allComics, setAllComics] = useState<MangaItem[]>([]);
  const [filteredComics, setFilteredComics] = useState<MangaItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      void loadComicsAndGenres();
    }, [])
  );

  // Filtrar cuando cambia el género o la búsqueda
  useEffect(() => {
    filterComics();
  }, [selectedGenre, searchQuery, allComics]);

  const loadComicsAndGenres = async () => {
    try {
      setLoading(true);
      const dataSource = new MangaRemoteDataSource();
      
      // Cargar catálogo público (con fallback)
      let apiComics: MangaItem[] = [];
      try {
        apiComics = await dataSource.getPublishedComics(0, 100);
      } catch {
        apiComics = await dataSource.getAllMangas();
      }

      // Cargar comics locales públicos para que lectores y creadores los puedan ver
      const publicLocal = await loadPublicWebcomics();
      const localComics: MangaItem[] = publicLocal.map((comic: any) => ({
        id: comic.id,
        title: comic.title,
        slug: comic.slug || `local-${comic.id}`,
        coverImagePath: comic.coverImage,
        genre: Array.isArray(comic.genres)
          ? comic.genres.join(', ')
          : (comic.genres || ''),
        creatorName: comic.creatorName || 'Creador',
        isLocal: true,
      }));

      // Combinar mangas locales + API
      const comicsMap = new Map<string, MangaItem>();
      for (const comic of localComics) comicsMap.set(String(comic.id), comic);
      for (const comic of apiComics) {
        // Si hay duplicado por id, priorizar API para mantener slug/capítulos correctos
        comicsMap.set(String(comic.id), comic);
      }
      const combinedComics = Array.from(comicsMap.values());
      setAllComics(combinedComics);

      // Contar mangas por género
      const genreCounts: { [key: string]: number } = {};
      GENRE_LABELS.forEach(g => genreCounts[g.title] = 0);

      combinedComics.forEach(comic => {
        if (comic.genre) {
          const genres = comic.genre.toLowerCase().split(',').map(g => g.trim());
          genres.forEach(g => {
            GENRE_LABELS.forEach(label => {
              if (label.title.toLowerCase() === g) {
                genreCounts[label.title]++;
              }
            });
          });
        }
      });

      // Mapear géneros con sus conteos
      const genresWithCounts = GENRE_LABELS.map(g => ({
        ...g,
        count: genreCounts[g.title] || 0,
      }));

      setGenres(genresWithCounts);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading comics:', error);
      // Fallback: mostrar géneros sin conteos
      const fallbackGenres = GENRE_LABELS.map(g => ({
        ...g,
        count: 0,
      }));
      setGenres(fallbackGenres);
      setLoading(false);
    }
  };

  const filterComics = () => {
    let filtered = allComics;

    // Filtrar por género seleccionado
    if (selectedGenre) {
      filtered = filtered.filter(comic => {
        if (!comic.genre) return false;
        const comicGenres = comic.genre.toLowerCase().split(',').map(g => g.trim());
        return comicGenres.some(g => g === selectedGenre.toLowerCase());
      });
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comic =>
        comic.title.toLowerCase().includes(query) ||
        comic.creatorName.toLowerCase().includes(query)
      );
    }

    setFilteredComics(filtered);
  };

  const renderMangaCard = ({ item }: { item: MangaItem }) => {
    // Para mangas locales que tengan coverImage en base64 o data URI
    // Para mangas del API, construir la URL completa
    const getImageSource = () => {
      if (!item.coverImagePath) {
        return { uri: 'https://via.placeholder.com/200x300?text=No+Cover' };
      }

      return { uri: buildCoverUrl(item.coverImagePath) };
    };

    const handlePress = () => {
      router.push({
        pathname: '/webcomic/[slug]',
        params: { slug: item.slug || item.id, mangaId: item.id },
      });
    };

    return (
      <TouchableOpacity 
        style={styles.mangaCardContainer}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <Image 
          source={getImageSource()}
          style={styles.mangaImage} 
        />
        <Text style={styles.mangaTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.mangaAuthor} numberOfLines={1}>{item.creatorName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.authInputBg }]}>
          <Feather name="search" size={18} color={theme.icon} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar mangas, autores..."
            placeholderTextColor={theme.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D8708E" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComics}
           keyExtractor={(item) => `${item.isLocal ? 'local' : 'api'}-${item.id}`}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>Géneros</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreFilters}>
                {genres.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.genreFilterChip,
                      selectedGenre === item.title && styles.genreFilterChipSelected,
                    ]}
                    onPress={() => setSelectedGenre(selectedGenre === item.title ? null : item.title)}
                  >
                    <Text
                      style={[
                        styles.genreFilterText,
                        selectedGenre === item.title && styles.genreFilterTextSelected,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.filterHeader}>
                {selectedGenre && (
                  <TouchableOpacity
                    style={styles.clearFilterBtn}
                    onPress={() => setSelectedGenre(null)}
                  >
                    <Text style={styles.clearFilterText}>✕ {selectedGenre}</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.sectionTitle}>
                  {filteredComics.length} mangas encontrados
                </Text>
              </View>
              {(selectedGenre || searchQuery) && (
                <View style={styles.filterHeader}>
                  {!!searchQuery && <Text style={styles.searchingText}>Buscando: "{searchQuery}"</Text>}
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                No se encontraron mangas
              </Text>
            </View>
          }
          renderItem={renderMangaCard}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  gridContent: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 12,
    marginBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#E0E0E0',
    fontSize: 11,
    fontWeight: '500',
  },
  cardContainerSelected: {
    borderWidth: 3,
    borderColor: '#D8708E',
  },
  filterHeader: {
    marginBottom: 16,
  },
  genreFilters: {
    paddingBottom: 12,
    gap: 8,
  },
  genreFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
  },
  genreFilterChipSelected: {
    backgroundColor: '#FDE4EA',
  },
  genreFilterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  genreFilterTextSelected: {
    color: '#D8708E',
  },
  clearFilterBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  clearFilterText: {
    color: '#D8708E',
    fontWeight: '600',
    fontSize: 12,
  },
  searchingText: {
    color: '#999',
    fontSize: 12,
  },
  mangaCardContainer: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  mangaImage: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  mangaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 8,
  },
  mangaAuthor: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
