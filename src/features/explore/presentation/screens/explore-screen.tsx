import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const PADDING_HORIZONTAL = 16;
const CARD_WIDTH = (width - PADDING_HORIZONTAL * 2 - CARD_MARGIN) / 2;

// --- Mock Data ---
const GENRES = [
  { id: '1', title: 'Drama', count: 8, image: 'https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=400&q=80' },
  { id: '2', title: 'Romance', count: 10, image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&q=80' },
  { id: '3', title: 'GL', count: 3, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80' },
  { id: '4', title: 'BL', count: 3, image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80' },
  { id: '5', title: 'Acción', count: 3, image: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?w=400&q=80' },
  { id: '6', title: 'Comedia', count: 3, image: 'https://images.unsplash.com/photo-1513628253939-010e64bc66d7?w=400&q=80' },
  { id: '7', title: 'Fantasía', count: 3, image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80' },
  { id: '8', title: 'Misterio', count: 3, image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&q=80' },
  { id: '9', title: 'Omegaverse', count: 1, image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80' },
  { id: '10', title: 'Historical', count: 1, image: 'https://images.unsplash.com/photo-1551221375-1a3b98c56fa2?w=400&q=80' },
  { id: '11', title: 'Horror', count: 1, image: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?w=400&q=80' },
  { id: '12', title: 'Informativo', count: 1, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80' },
  { id: '13', title: 'Sobrenatural', count: 4, image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80' },
  { id: '14', title: 'Superhero', count: 1, image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80' },
  { id: '15', title: 'Vida Cotidiana', count: 0, image: 'https://images.unsplash.com/photo-1490750967868-88cb4ecb07cb?w=400&q=80' },
];

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const theme = Colors.light;

  const [searchQuery, setSearchQuery] = useState('');

  const renderItem = ({ item }: { item: typeof GENRES[0] }) => (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/explore/[genre]', params: { genre: item.title } })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.count} mangas</Text>
      </View>
    </TouchableOpacity>
  );

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

      {/* Grid Content */}
      <FlatList
        data={GENRES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Géneros</Text>
        }
        renderItem={renderItem}
      />
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
});
