import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';

const { width } = Dimensions.get('window');

// --- Mock Data ---
const HERO_ITEMS = [
  { id: '1', title: 'Café Medianoche', image: 'https://images.unsplash.com/photo-1549488344-c71c4c1a9642?w=800&q=80' },
  { id: '2', title: 'Aventura Estelar', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80' },
  { id: '3', title: 'Sombras del Alma', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&q=80' },
  { id: '4', title: 'Destinos Cruzados', image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&q=80' },
  { id: '5', title: 'Sol de Medianoche', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80' },
];

const CATEGORIES = [
  {
    title: 'Romance',
    mangas: [
      { id: 'r1', title: 'Amor en', image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&q=80' },
      { id: 'r2', title: 'Flores de', image: 'https://images.unsplash.com/photo-1490750967868-88cb4ecb07cb?w=400&q=80' },
      { id: 'r3', title: 'Entre Pinturas', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80' },
    ],
  },
  {
    title: 'GL',
    mangas: [
      { id: 'gl1', title: 'Flores de', image: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=400&q=80' },
      { id: 'gl2', title: 'Entre Pinturas', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80' },
      { id: 'gl3', title: 'Café y Prome', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80' },
    ],
  },
  {
    title: 'BL',
    mangas: [
      { id: 'bl1', title: 'Corazones', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80' },
      { id: 'bl2', title: 'Melodías del', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
      { id: 'bl3', title: 'Bajo el Mismo Cielo', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80' },
    ],
  },
  {
    title: 'Drama',
    mangas: [
      { id: 'd1', title: 'Café Mediano', image: 'https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=400&q=80' },
      { id: 'd2', title: 'Ritmo Urbano', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
      { id: 'd3', title: 'Amor en', image: 'https://images.unsplash.com/photo-1474959783192-26942fa64380?w=400&q=80' },
    ],
  },
  {
    title: 'Fantasía',
    mangas: [
      { id: 'f1', title: 'Corazón de Dragón', image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80' },
      { id: 'f2', title: 'Academia', image: 'https://images.unsplash.com/photo-1516979187455-2253caba2ab6?w=400&q=80' },
      { id: 'f3', title: 'Espíritus de la Ciudad', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80' },
    ],
  },
  {
    title: 'Acción',
    mangas: [
      { id: 'a1', title: 'Sombras de Neon', image: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?w=400&q=80' },
      { id: 'a2', title: 'El Último', image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80' },
      { id: 'a3', title: 'Guardianes del Alba', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80' },
    ],
  },
];

// --- Components ---

function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % HERO_ITEMS.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000); // 4 seconds auto-scroll
    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={HERO_ITEMS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(ev) => {
          const index = Math.floor(ev.nativeEvent.contentOffset.x / ev.nativeEvent.layoutMeasurement.width);
          setActiveIndex(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.heroSlide}>
            <Image source={{ uri: item.image }} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{item.title}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.pagination}>
        {HERO_ITEMS.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryRow({ category }: { category: typeof CATEGORIES[0] }) {
  const theme = Colors.light;

  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <TouchableOpacity>
          <Text style={[styles.verTodo, { color: theme.authPrimary }]}>Ver todo</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {category.mangas.map((manga) => (
          <TouchableOpacity key={manga.id} style={styles.mangaCard} activeOpacity={0.8}>
            <Image source={{ uri: manga.image }} style={styles.mangaImage} />
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
  return (
    <View style={styles.screen}>
      {/* Header Logo */}
      <View style={styles.header}>
        <Text style={styles.headerLogoText}>Mangaty</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <HeroCarousel />

        <View style={styles.categoriesWrapper}>
          {CATEGORIES.map((cat, idx) => (
            <CategoryRow key={idx} category={cat} />
          ))}
        </View>
      </ScrollView>
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
  carouselContainer: {
    height: 220,
    marginBottom: 24,
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
