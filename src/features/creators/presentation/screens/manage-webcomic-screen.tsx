import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { ManageWebcomicViewModel } from '../view-models/manage-webcomic-view-model';
import { buildCoverUrl } from '@/src/core/api/api-config';

const { width } = Dimensions.get('window');

interface Props {
  slug: string;
  mangaId: string;
}

export default function ManageWebcomicScreen({ slug, mangaId }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<ManageWebcomicViewModel>(() =>
    serviceLocator.get(DIKeys.MANAGE_WEBCOMIC_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadMangaDetails(slug, mangaId);
    return unsubscribe;
  }, [viewModel, slug, mangaId]);

  // Recargar datos cuando la pantalla vuelve a estar visible (ej: después de editar)
  useFocusEffect(
    useCallback(() => {
      viewModel.loadMangaDetails(slug, mangaId);
    }, [viewModel, slug, mangaId])
  );

  const stats = [
    { label: 'Vistas', value: state.stats.views, icon: 'eye' },
    { label: 'Seguidores', value: state.stats.followers, icon: 'users' },
    { label: 'Me gusta', value: state.stats.likes, icon: 'trending-up' },
  ];

  if (state.isLoading && !state.manga) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#D8708E" />
      </View>
    );
  }

  const manga = state.manga;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Webcomic</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push({
            pathname: `/manage-webcomic/[id]/edit-info`,
            params: { id: mangaId, slug: slug }
          })}
        >
          <Feather name="edit-3" size={22} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.coverPlaceholder}>
            {manga?.coverImagePath ? (
              <Image
                source={{ uri: manga.coverImagePath.startsWith('file://')
                  ? manga.coverImagePath
                  : buildCoverUrl(manga.coverImagePath)
                }}
                style={styles.coverImage}
              />
            ) : (
              <Text style={styles.placeholderText}>Sin portada</Text>
            )}
          </View>
          
          <View style={styles.textInfo}>
            <Text style={styles.mangaTitle}>{manga?.title || 'Cargando...'}</Text>
            
            <View style={styles.genresRow}>
              {manga?.genre.split(',').map((g, i) => (
                <View key={i} style={styles.genreTag}>
                  <Text style={styles.genreText}>{g.trim()}</Text>
                </View>
              )) || (
                <View style={styles.genreTag}>
                  <Text style={styles.genreText}>Género</Text>
                </View>
              )}
            </View>

            <Text style={styles.mangaSyncopsis} numberOfLines={2}>
              {manga?.synopsis || 'fafa'}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Feather name={stat.icon as any} size={20} color="#D8708E" style={styles.statIcon} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Chapters Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Capítulos</Text>
          <TouchableOpacity
            style={styles.newChapterButton}
            onPress={() => router.push(`/manage-webcomic/${mangaId}/new-chapter`)}
          >
            <Feather name="plus" size={16} color="#FFF" />
            <Text style={styles.newChapterText}>Nuevo capítulo</Text>
          </TouchableOpacity>
        </View>

        {(!manga?.chaptersData || manga.chaptersData.length === 0) ? (
          <View style={styles.chaptersCard}>
            <View style={styles.emptyIconContainer}>
              <Feather name="plus" size={32} color="#D8708E" />
            </View>
            <Text style={styles.emptyChaptersTitle}>Aún no tienes capítulos</Text>
            <Text style={styles.emptyChaptersSubtitle}>
              Comienza a publicar tu historia subiendo el primer capítulo
            </Text>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.push(`/manage-webcomic/${mangaId}/new-chapter`)}
            >
              <Text style={styles.primaryActionButtonText}>Subir primer capítulo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.chaptersList}>
            {manga.chaptersData.map((chapter, index) => (
              <TouchableOpacity
                key={chapter.id || index}
                style={styles.chapterItem}
                onPress={() => router.push({
                  pathname: `/manage-webcomic/[id]/chapter-viewer`,
                  params: { id: mangaId, chapterId: chapter.id }
                })}
              >
                <View style={styles.chapterNumber}>
                  <Text style={styles.chapterNumberText}>Cap. {chapter.chapterNumber}</Text>
                </View>
                <View style={styles.chapterInfo}>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                  <Text style={styles.chapterDate}>
                    {chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString('es-ES') : 'Publicado'}
                  </Text>
                </View>
                <View style={styles.chapterMeta}>
                  {chapter.premium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={20} color="#D8708E" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Creator Management */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Gestión del creador</Text>
        
        <View style={styles.managementList}>
          <ManagementItem 
            label="Ver analíticas" 
            icon="trending-up" 
            onPress={() => router.push({
              pathname: `/manage-webcomic/[id]/analytics`,
              params: { id: mangaId, slug: slug }
            })}
          />
          <ManagementItem 
            label="Configurar monetización" 
            icon="dollar-sign" 
            onPress={() => router.push(`/manage-webcomic/${mangaId}/monetization`)}
          />
          <ManagementItem 
            label="Editar información" 
            icon="edit-3" 
            onPress={() => router.push({
              pathname: `/manage-webcomic/[id]/edit-info`,
              params: { id: mangaId, slug: slug }
            })}
          />
          <ManagementItem 
            label="Configurar acceso" 
            icon="lock" 
            onPress={() => router.push(`/manage-webcomic/${mangaId}/access`)}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ManagementItem({ label, icon, onPress }: { label: string; icon: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.managementItem} onPress={onPress}>
      <Text style={styles.managementLabel}>{label}</Text>
      <Feather name={icon as any} size={20} color="#666" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  scrollContent: {
    padding: 20,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  coverPlaceholder: {
    width: 120,
    height: 160,
    backgroundColor: '#F8E8EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  placeholderText: {
    color: '#D8708E',
    fontSize: 14,
    opacity: 0.6,
  },
  textInfo: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 4,
  },
  mangaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  genreTag: {
    backgroundColor: '#FCF0F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F6D6DF',
  },
  genreText: {
    color: '#D8708E',
    fontSize: 12,
    fontWeight: '500',
  },
  mangaSyncopsis: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FCFBFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  statIcon: {
    marginBottom: 8,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  newChapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D17C8A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  newChapterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chaptersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyChaptersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptyChaptersSubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  primaryActionButton: {
    backgroundColor: '#E2919E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryActionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  managementList: {
    gap: 12,
  },
  managementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  managementLabel: {
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '600',
  },
  chaptersList: {
    gap: 12,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  chapterNumber: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FDF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chapterNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D8708E',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  chapterDate: {
    fontSize: 12,
    color: '#999',
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBadge: {
    backgroundColor: '#FFE5CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF9800',
  },
});
