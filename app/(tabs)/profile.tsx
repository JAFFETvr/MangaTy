import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPhotoStorageKey } from '@/app/settings';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { ProfileViewModel } from '@/src/features/user/presentation/view-models/profile-view-model';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<ProfileViewModel>(() =>
    serviceLocator.get(DIKeys.PROFILE_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadUser();
    return unsubscribe;
  }, [viewModel]);

  const user = state.user;

  // Recarga la foto cada vez que la pantalla entra en foco y cuando el usuario está disponible
  useFocusEffect(
    useCallback(() => {
      if (user?.email) {
        AsyncStorage.getItem(getPhotoStorageKey(user.email)).then((saved) => {
          setPhotoUri(saved || null);
        });
      } else {
        setPhotoUri(null);
      }
    }, [user?.email])
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
            <Text style={styles.statNumber}>{user?.stats?.mangasRead ?? 0}</Text>
            <Text style={styles.statLabel}>Leyendo</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statNumber}>{user?.stats?.favorites ?? 0}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.stats?.chaptersRead ?? 0}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        {/* Card Crear Webcomic */}
        <TouchableOpacity style={styles.creatorCard} activeOpacity={0.85}>
          <View style={styles.creatorIconWrapper}>
            <Feather name="star" size={22} color="#D8708E" />
          </View>
          <View style={styles.creatorText}>
            <Text style={styles.creatorTitle}>Crear Webcomic</Text>
            <Text style={styles.creatorSubtitle}>Comparte tus historias y gana dinero</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>

        {/* Historial de lectura */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="clock" size={16} color="#D8708E" />
            <Text style={styles.sectionTitle}>Historial de lectura</Text>
          </View>
          <Text style={styles.seeAll}>Ver todo</Text>
        </View>

        {/* Estado vacío para historial */}
        <View style={styles.emptyState}>
          <Feather name="book-open" size={36} color="#E0C4CC" />
          <Text style={styles.emptyStateText}>Aún no has leído ningún manga</Text>
        </View>

        {/* Mis favoritos */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="heart" size={16} color="#D8708E" />
            <Text style={styles.sectionTitle}>Mis favoritos</Text>
          </View>
          <Text style={styles.seeAll}>Ver todo</Text>
        </View>

        {/* Estado vacío para favoritos */}
        <View style={[styles.emptyState, { marginBottom: 40 }]}>
          <Feather name="heart" size={36} color="#E0C4CC" />
          <Text style={styles.emptyStateText}>Aún no tienes favoritos</Text>
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
});

