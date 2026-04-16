import { getPhotoStorageKey } from '@/app/settings';
import { buildCoverUrl } from '@/src/core/api/api-config';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { FavoritesViewModel } from '@/src/features/favorites/presentation/view-models/favorites-view-model';
import { HistoryViewModel } from '@/src/features/history/presentation/view-models/history-view-model';
import { ProfileViewModel } from '@/src/features/user/presentation/view-models/profile-view-model';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<ProfileViewModel>(() =>
    serviceLocator.get(DIKeys.PROFILE_VIEW_MODEL)
  );
  const [historyVM] = useState<HistoryViewModel>(() =>
    serviceLocator.get(DIKeys.HISTORY_VIEW_MODEL)
  );
  const [favoritesVM] = useState<FavoritesViewModel>(() =>
    serviceLocator.get(DIKeys.FAVORITES_VIEW_MODEL)
  );

  const [state, setState] = useState(viewModel.getState());
  const [historyState, setHistoryState] = useState(historyVM.getState());
  const [favoritesState, setFavoritesState] = useState(favoritesVM.getState());

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [hasCreatedWebcomics, setHasCreatedWebcomics] = useState(false);

  useEffect(() => {
    const unsubProfile = viewModel.state$.subscribe(setState);
    const unsubHistory = historyVM.state$.subscribe(setHistoryState);
    const unsubFavorites = favoritesVM.state$.subscribe(setFavoritesState);

    viewModel.loadUser();
    historyVM.loadHistory();
    favoritesVM.loadFavorites();

    return () => {
      unsubProfile();
      unsubHistory();
      unsubFavorites();
    };
  }, [viewModel, historyVM, favoritesVM]);

  const user = state.user;

  // Recarga la foto cada vez que la pantalla entra en foco y cuando el usuario está disponible
  useFocusEffect(
    useCallback(() => {
      void historyVM.loadHistory();
      void favoritesVM.loadFavorites();
      void viewModel.loadUser();

      AsyncStorage.getItem('@mock_created_webcomics').then((val) => {
        if (val) {
          const list = JSON.parse(val);
          setHasCreatedWebcomics(list.length > 0);
        } else {
          setHasCreatedWebcomics(false);
        }
      });

      if (user?.email) {
        AsyncStorage.getItem(getPhotoStorageKey(user.email)).then((saved) => {
          if (saved?.startsWith('blob:')) {
            void AsyncStorage.removeItem(getPhotoStorageKey(user.email));
            setPhotoUri(null);
            return;
          }
          setPhotoUri(saved || null);
        });
      } else {
        setPhotoUri(null);
      }
    }, [user?.email, historyVM, favoritesVM, viewModel])
  );

  // Muestra el nombre registrado; si aún no hay sesión guardada muestra un placeholder
  const displayName = user?.name && user.name !== 'Usuario' ? user.name : 'Mi Perfil';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header de Perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={[styles.avatarCircle, { overflow: 'hidden' }]} />
            ) : (
              <View style={styles.avatarCircle}>
                <Feather name="user" size={48} color="#D8708E" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSubtitle}>Lector activo</Text>
          </View>

          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Feather name="settings" size={22} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{historyState.history.length}</Text>
            <Text style={styles.statLabel}>Historial</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statNumber}>{favoritesState.favorites.length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.stats?.chaptersRead ?? 0}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        {/* Card Crear / Ver Webcomic (Dependiendo de si ya tiene cómics creados) */}
        {hasCreatedWebcomics ? ( // TODO: Conectar con el estado real del usuario (ej: user?.createdWebcomics?.length > 0)
          <TouchableOpacity style={styles.creatorCard} activeOpacity={0.85} onPress={() => router.push('/my-webcomics')}>
            <View style={[styles.creatorIconWrapper, { backgroundColor: '#D8708E', borderColor: '#D8708E' }]}>
              <Feather name="star" size={20} color="#FFF" />
            </View>
            <View style={styles.creatorText}>
              <Text style={styles.creatorTitle}>Ver tus Webcomics</Text>
              <Text style={styles.creatorSubtitle}>Administra tu contenido y estadísticas</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.creatorCard} activeOpacity={0.85} onPress={() => router.push('/create-webcomic')}>
            <View style={styles.creatorIconWrapper}>
              <Feather name="star" size={22} color="#D8708E" />
            </View>
            <View style={styles.creatorText}>
              <Text style={styles.creatorTitle}>Crear Webcomic</Text>
              <Text style={styles.creatorSubtitle}>Comparte tus historias y gana dinero</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        )}

        {/* Historial de lectura */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="clock" size={16} color="#D8708E" />
            <Text style={styles.sectionTitle}>Historial de lectura</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {/* Estado dinámico para historial */}
        {historyState.history.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={36} color="#E0C4CC" />
            <Text style={styles.emptyStateText}>Aún no has leído ningún manga</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewScroll}>
            {historyState.history.slice(0, 5).map((item) => (
              <TouchableOpacity 
                key={item.manga.id} 
                style={styles.previewCard}
                onPress={() => router.push({ pathname: '/webcomic/[slug]', params: { slug: item.manga.slug, mangaId: item.manga.id } })}
              >
                <Image source={{ uri: item.manga.coverImagePath ? buildCoverUrl(item.manga.coverImagePath) : '' }} style={styles.previewImage} />
                <Text style={styles.previewTitle} numberOfLines={1}>{item.manga.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Mis favoritos */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="heart" size={16} color="#D8708E" />
            <Text style={styles.sectionTitle}>Mis favoritos</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/favorites')}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {/* Estado dinámico para favoritos */}
        {favoritesState.favorites.length === 0 ? (
          <View style={[styles.emptyState, { marginBottom: 40 }]}>
            <Feather name="heart" size={36} color="#E0C4CC" />
            <Text style={styles.emptyStateText}>Aún no tienes favoritos</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.previewScroll, { marginBottom: 40 }]}>
            {favoritesState.favorites.slice(0, 5).map((manga) => (
              <TouchableOpacity 
                key={manga.id} 
                style={styles.previewCard}
                onPress={() => router.push({ pathname: '/webcomic/[slug]', params: { slug: manga.slug, mangaId: manga.id } })}
              >
                <Image source={{ uri: manga.coverImagePath ? buildCoverUrl(manga.coverImagePath) : '' }} style={styles.previewImage} />
                <Text style={styles.previewTitle} numberOfLines={1}>{manga.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FCF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F6D6DF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  settingsButton: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statCardMiddle: {
    borderColor: '#F6E9EB',
    backgroundColor: '#FDF5F7',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FDF5F7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F6E9EB',
  },
  creatorIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F6E9EB',
  },
  creatorText: {
    flex: 1,
  },
  creatorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  creatorSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  seeAll: {
    fontSize: 13,
    color: '#D8708E',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 13,
    color: '#BBB',
  },
  previewScroll: {
    paddingLeft: 16,
    paddingBottom: 24,
    gap: 12,
  },
  previewCard: {
    width: 100,
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A2E',
  },
});
