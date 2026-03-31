/**
 * HomeScreen - Tab 1 - Grid de mangas con búsqueda
 */

import { COLORS } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { HomeViewModel } from '@/src/features/manga/presentation';
import { MangaCard } from '@/src/features/manga/presentation/components';
import { BottomNav, SearchBar, TopBar } from '@/src/shared/components';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
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

  if (state.isLoading && state.filteredMangas.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar coinBalance={50} onMenuPress={() => setMenuOpen(true)} onBellPress={() => {}} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.pink} />
        </View>
        <BottomNav activeTab="home" onTabChange={() => {}} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar coinBalance={50} onMenuPress={() => setMenuOpen(true)} onBellPress={() => {}} />

      <SearchBar onSearch={handleSearch} />

      <FlatList
        data={state.filteredMangas}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <MangaCard manga={item} onPress={() => handleMangaPress(item.id)} />
          </View>
        )}
        contentContainerStyle={styles.content}
        scrollEnabled={true}
      />

      {state.error && <Text style={styles.error}>{state.error}</Text>}

      <BottomNav activeTab="home" onTabChange={() => {}} />
    </View>
  );
}
