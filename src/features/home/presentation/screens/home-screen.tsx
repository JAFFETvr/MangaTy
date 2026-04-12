import { Colors } from '@/constants/theme';
import { buildCoverUrl } from '@/src/core/api/api-config';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeScreenViewModel, HomeScreenState } from '../home-screen-view-model';
import { MangaRemoteDataSource } from '@/src/features/manga/data/datasources/manga-remote-datasource';

const { width } = Dimensions.get('window');

// Navegar con slug + mangaId tal como dicta la documentación de la API
const navigateToDetail = (slug: string, mangaId: string) => {
  router.push({ pathname: '/webcomic/[slug]', params: { slug, mangaId } });
};

// Géneros para mantener la estructura
const GENRE_CATEGORIES = ['Romance', 'GL', 'BL', 'Drama', 'Fantasía', 'Acción'];

// ── Carrusel Hero ──
function HeroCarousel({ comics }: { comics: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (comics.length === 0) return;
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % comics.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex, comics.length]);

  if (comics.length === 0) {
    return (
      <View style={styles.carouselContainer}>
        <View style={styles.emptyCarousel}>
          <Text style={styles.emptyText}>No hay comics disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={comics}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(ev) => {
          const idx = Math.floor(ev.nativeEvent.contentOffset.x / ev.nativeEvent.layoutMeasurement.width);
          setActiveIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.heroSlide}
            activeOpacity={0.9}
            onPress={() => navigateToDetail(item.slug, item.id)}
          >
            <Image
              source={{ uri: buildCoverUrl(item.coverImagePath) }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.heroSubtitle}>por {item.creatorName}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.pagination}>
        {comics.map((_, index) => (
          <View key={index} style={[styles.dot, index === activeIndex && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

// ── Fila de categoría ──
function CategoryRow({ title, mangas }: { title: string; mangas: any[] }) {
  const theme = Colors.light;
  
  if (mangas.length === 0) {
    return null; // No mostrar categorías vacías
  }

  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={[styles.verTodo, { color: theme.authPrimary }]}>Ver todo</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {mangas.map((manga) => (
          <TouchableOpacity
            key={manga.id}
            style={styles.mangaCard}
            activeOpacity={0.8}
            onPress={() => navigateToDetail(manga.slug, manga.id)}
          >
            <Image 
              source={{ uri: buildCoverUrl(manga.coverImagePath) }} 
              style={styles.mangaImage} 
            />
            <View style={styles.mangaOverlay}>
              <Text style={styles.mangaTitle} numberOfLines={2}>{manga.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Sección "Mis Comics" ──
function MyComicsSection({ comics }: { comics: any[] }) {
  if (comics.length === 0) {
    return null;
  }

  return (
    <View style={styles.myComicsContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Mis Comics</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {comics.map((manga) => (
          <TouchableOpacity
            key={manga.id}
            style={styles.mangaCard}
            activeOpacity={0.8}
            onPress={() => navigateToDetail(manga.slug, manga.id)}
          >
            <Image 
              source={{ uri: buildCoverUrl(manga.coverImagePath) }} 
              style={styles.mangaImage} 
            />
            <View style={styles.mangaOverlay}>
              <Text style={styles.mangaTitle} numberOfLines={2}>{manga.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function HomeScreen() {
  const [state, setState] = useState<HomeScreenState>({
    featuredComics: [],
    myComics: [],
    categoryComics: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const viewModel = new HomeScreenViewModel(new MangaRemoteDataSource());
    const unsubscribe = viewModel.subscribe((newState) => {
      setState(newState);
    });

    viewModel.loadHomeData();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerLogoText}>Mangaty</Text>
      </View>

      {state.loading && state.featuredComics.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D8708E" />
          <Text style={styles.loadingText}>Cargando comics...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          )}

          <HeroCarousel comics={state.featuredComics} />

          {state.myComics.length > 0 && <MyComicsSection comics={state.myComics} />}

          <View style={styles.categoriesWrapper}>
            {GENRE_CATEGORIES.map((genre) => (
              <CategoryRow
                key={genre}
                title={genre}
                mangas={state.categoryComics[genre] || []}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D8708E',
    fontStyle: 'italic',
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
  errorContainer: {
    backgroundColor: '#FFE0E0',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
  },
  carouselContainer: {
    height: 220,
    marginBottom: 24,
  },
  emptyCarousel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  heroSlide: {
    width: width,
    height: 220,
    paddingHorizontal: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    marginHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateY: -1 }],
  },
  categoriesWrapper: {
    paddingHorizontal: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  myComicsContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingRight: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  verTodo: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowScroll: {
    paddingRight: 16,
  },
  mangaCard: {
    width: 100,
    height: 140,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mangaImage: {
    width: '100%',
    height: '100%',
  },
  mangaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  mangaTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
