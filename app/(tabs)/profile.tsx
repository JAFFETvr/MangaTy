/**
 * ProfileScreen - Tab 3 - Perfil de usuario
 */

import { COLORS } from '@/src/core/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { ProfileViewModel } from '@/src/features/user/presentation';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  userStatus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  balanceIcon: {
    fontSize: 24,
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buyButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textDark,
  },
  statLabel: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textDark,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  webcomicsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  webcomicsIcon: {
    marginRight: 12,
  },
  webcomicsContent: {
    flex: 1,
  },
  webcomicsTitle: {
    color: '#000',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  webcomicsSubtitle: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  webcomicsArrow: {
    color: '#fff',
  },
  mangaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mangaCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  mangaImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E0E0E0',
  },
  mangaTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.textDark,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

const MOCK_READING_HISTORY = [
  { id: 1, title: 'Sombras de Ner', cover: 'https://via.placeholder.com/100x140' },
  { id: 2, title: 'Corazón de Oro', cover: 'https://via.placeholder.com/100x140' },
  { id: 3, title: 'Café Medianoche', cover: 'https://via.placeholder.com/100x140' },
];

const MOCK_FAVORITES = [
  { id: 1, title: 'Sombras de Ner', cover: 'https://via.placeholder.com/100x140' },
  { id: 2, title: 'Academia Azul', cover: 'https://via.placeholder.com/100x140' },
  { id: 3, title: 'Ritmo Urbano', cover: 'https://via.placeholder.com/100x140' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const viewModel = serviceLocator.get<ProfileViewModel>(DIKeys.PROFILE_VIEW_MODEL);
  const state = useStateFlow(viewModel.state$);

  useMVVM(
    async () => {
      await viewModel.loadUser();
    },
    undefined
  );

  if (!state.user) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const { user } = state;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.userHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={COLORS.textLight} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userStatus}>Lector activo</Text>
            </View>
            <TouchableOpacity style={styles.settingsIcon}>
              <Ionicons name="settings-outline" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <TouchableOpacity 
            style={styles.balanceCard}
            onPress={() => router.push('/coin-store')}
          >
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceIcon}>💰</Text>
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Tu Balance</Text>
                <Text style={styles.balanceAmount}>350 Monedas</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Comprar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.stats?.mangasRead || 3}</Text>
            <Text style={styles.statLabel}>Leídos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.stats?.favorites || 3}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.stats?.chaptersRead || 32}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        {/* Crear WebComic */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={styles.webcomicsCard}
            onPress={() => router.push('/my-webcomics')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="create" size={28} color={COLORS.primary} style={styles.webcomicsIcon} />
              <View style={styles.webcomicsContent}>
                <Text style={styles.webcomicsTitle}>Crear Webcomic</Text>
                <Text style={styles.webcomicsSubtitle}>Comparte tu historia</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Historial de lectura */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial de lectura</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mangaGrid}>
            {MOCK_READING_HISTORY.map((manga) => (
              <View key={manga.id} style={styles.mangaCard}>
                <Image
                  source={{ uri: manga.cover }}
                  style={styles.mangaImage}
                  contentFit="cover"
                />
                <Text style={styles.mangaTitle}>{manga.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mis favoritos */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis favoritos</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mangaGrid}>
            {MOCK_FAVORITES.map((manga) => (
              <View key={manga.id} style={styles.mangaCard}>
                <Image
                  source={{ uri: manga.cover }}
                  style={styles.mangaImage}
                  contentFit="cover"
                />
                <Text style={styles.mangaTitle}>{manga.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}
