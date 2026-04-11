/**
 * WebcomicDetailScreen — Plantilla dinámica
 *
 * Recibe por parámetros de navegación: { slug, mangaId }
 * - slug   → GET /api/comics/{slug}       (detalle + vistas)
 * - mangaId → GET /api/comics/{id}/chapters (capítulos PUBLISHED)
 *
 * Ambas peticiones se lanzan en paralelo con Promise.all.
 * CERO datos hardcodeados en esta pantalla.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { MangaDetailViewModel } from '../view-models/manga-detail-view-model';
import { buildCoverUrl } from '@/src/core/api/api-config';
import { Chapter } from '../../domain/entities/chapter';
import { PurchaseModal } from '../components/purchase-modal';
import { ChapterPurchaseViewModel } from '../view-models/chapter-purchase-view-model';

interface WebcomicDetailScreenProps {
  slug: string;
  mangaId: string;
  /** IDs de capítulos que el usuario ya desbloqueó (viene del auth/unlocked state) */
  unlockedChapterIds?: string[];
}

export default function WebcomicDetailScreen({
  slug,
  mangaId,
  unlockedChapterIds = [],
}: WebcomicDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<MangaDetailViewModel>(() =>
    serviceLocator.get<MangaDetailViewModel>(DIKeys.MANGA_DETAIL_VIEW_MODEL)
  );
  const [purchaseViewModel] = useState<ChapterPurchaseViewModel>(() =>
    serviceLocator.get<ChapterPurchaseViewModel>(DIKeys.CHAPTER_PURCHASE_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());
  const [purchaseState, setPurchaseState] = useState(purchaseViewModel.getState());
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    const unsubscribePurchase = purchaseViewModel.state$.subscribe(setPurchaseState);
    
    viewModel.loadDetail(slug, mangaId);
    
    return () => {
      unsubscribe();
      unsubscribePurchase();
    };
  }, [slug, mangaId]);

  useEffect(() => {
    if (purchaseState.success) {
      setModalVisible(false);
      // Actualizar estado local — en una app real esto vendría de refrescar el unlocked state
      handleConfirmPurchaseNavigation();
    }
    if (purchaseState.insufficientCoins) {
      setModalVisible(false);
      Alert.alert(
        'Saldo insuficiente', 
        'No tienes suficientes monedas para comprar este capítulo. ¿Quieres ir a la tienda?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir a la tienda', onPress: () => router.push('/tienda') }
        ]
      );
      purchaseViewModel.reset();
    }
  }, [purchaseState.success, purchaseState.insufficientCoins]);

  const handleConfirmPurchaseNavigation = () => {
     if (purchaseState.chapter) {
       router.push({
         pathname: '/reader/[mangaId]/[chapterId]',
         params: {
           mangaId: mangaId,
           chapterId: purchaseState.chapter.id,
           isPremium: '0', // Ya comprado
         },
       });
       purchaseViewModel.reset();
     }
  };

  const { manga, isLoading, error } = state;

  // ─────────────── ESTADOS DE CARGA / ERROR ───────────────
  if (isLoading) {
    return (
      <View style={[styles.centerState, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#D8708E" />
        <Text style={styles.loadingText}>Cargando webcomic...</Text>
      </View>
    );
  }

  if (error || !manga) {
    return (
      <View style={[styles.centerState, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={40} color="#E0C4CC" />
        <Text style={styles.errorText}>{error ?? 'Webcomic no encontrado'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────── LÓGICA DE CAPÍTULOS ───────────────
  const isUnlocked = (ch: Chapter) => unlockedChapterIds.includes(ch.id);

  /** Primer capítulo que el usuario puede leer sin pagar  */
  const firstAvailableChapter =
    manga.chaptersData.find((ch) => !ch.premium || isUnlocked(ch)) ??
    manga.chaptersData[0];

  const handleStartReading = () => {
    if (!firstAvailableChapter) return;
    router.push({
      pathname: '/reader/[mangaId]/[chapterId]',
      params: {
        mangaId: manga.id,
        chapterId: firstAvailableChapter.id,
        isPremium: firstAvailableChapter.premium ? '1' : '0',
      },
    });
  };

  const handleChapterPress = (ch: Chapter) => {
    const unlocked = isUnlocked(ch);
    const isFree = !ch.premium;

    if (isFree || unlocked) {
      router.push({
        pathname: '/reader/[mangaId]/[chapterId]',
        params: {
          mangaId: manga.id,
          chapterId: ch.id,
          isPremium: ch.premium ? '1' : '0',
        },
      });
    } else {
      // Mostrar modal de compra
      purchaseViewModel.setChapter(ch);
      setModalVisible(true);
    }
  };

  // ─────────────── HELPERS DE UI ───────────────
  const formatViews = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };

  const formatDate = (iso: string): string => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const coverUrl = manga.coverImagePath ? buildCoverUrl(manga.coverImagePath) : null;

  // ─────────────── RENDER ───────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#555" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="share-2" size={20} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { marginLeft: 12 }]}>
            <Feather name="heart" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Info principal ── */}
        <View style={styles.mainInfoContainer}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Feather name="image" size={28} color="#ccc" />
            </View>
          )}

          <View style={styles.textInfoContainer}>
            <Text style={styles.title} numberOfLines={3}>{manga.title}</Text>
            <Text style={styles.author}>por {manga.creatorName}</Text>

            <View style={styles.statsRow}>
              {/* Rating no existe en la API — se omite por ahora */}
              <View style={styles.statItem}>
                <Feather name="eye" size={15} color="#888" />
                <Text style={styles.statText}>{formatViews(manga.viewsCount)}</Text>
              </View>
              {manga.mature && (
                <View style={styles.matureBadge}>
                  <Text style={styles.matureBadgeText}>+18</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── Géneros — API devuelve 1 solo string ── */}
        {manga.genre ? (
          <View style={styles.genresRow}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>{manga.genre}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Sinopsis ── */}
        <Text style={styles.sectionTitle}>Sinopsis</Text>
        <Text style={styles.synopsisText}>{manga.synopsis}</Text>

        {/* ── Capítulos Header ── */}
        <View style={styles.chaptersHeaderRow}>
          <Text style={styles.sectionTitle}>
            {manga.chaptersData.length} Capítulo{manga.chaptersData.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity>
            <Text style={styles.sortText}>Ordenar</Text>
          </TouchableOpacity>
        </View>

        {/* ── Lista de Capítulos ── */}
        <View style={styles.chaptersList}>
          {manga.chaptersData.length === 0 ? (
            <View style={styles.emptyChapters}>
              <Feather name="folder-minus" size={32} color="#E0C4CC" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyChaptersText}>Aún no hay capítulos disponibles.</Text>
            </View>
          ) : (
            manga.chaptersData.map((chapter) => {
              const unlocked = isUnlocked(chapter);
              const isFree = !chapter.premium;

              return (
                <TouchableOpacity
                  key={chapter.id}
                  style={styles.chapterCard}
                  activeOpacity={0.7}
                  onPress={() => handleChapterPress(chapter)}
                >
                  {/* Ícono */}
                  <View style={styles.chapterIconWrapper}>
                    {isFree || unlocked ? (
                      <Feather name="play" size={20} color="#F080A1" style={{ marginLeft: 2 }} />
                    ) : (
                      <Feather name="lock" size={18} color="#777" />
                    )}
                  </View>

                  <View style={styles.chapterDetails}>
                    <View style={styles.chapterTitleRow}>
                      <Text style={styles.chapterTitle} numberOfLines={1}>
                        Cap. {chapter.chapterNumber}: {chapter.title}
                      </Text>

                      {/* Badge según tipo */}
                      {unlocked && (
                        <View style={styles.unlockedBadge}>
                          <Feather name="unlock" size={10} color="#27A45C" />
                          <Text style={styles.unlockedBadgeText}>Desbloqueado</Text>
                        </View>
                      )}
                      {!unlocked && isFree && (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>Gratis con anuncios</Text>
                        </View>
                      )}
                      {!unlocked && !isFree && (
                        <View style={styles.coinBadge}>
                          <FontAwesome5 name="coins" size={10} color="#F5A623" />
                          <Text style={styles.coinBadgeText}>{chapter.priceTyCoins}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.chapterSubRow}>
                      {/* vistas por capítulo no disponible en API aún */}
                      <Text style={styles.chapterSubTextDate}>{formatDate(chapter.publishedAt)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── Botón Comenzar a Leer ── */}
      <View style={[styles.bottomFixedArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.readButton, !firstAvailableChapter && styles.readButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleStartReading}
          disabled={!firstAvailableChapter}
        >
          <Feather name="play" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.readButtonText}>Comenzar a Leer</Text>
        </TouchableOpacity>
      </View>

      <PurchaseModal 
        visible={modalVisible}
        chapter={purchaseState.chapter}
        isLoading={purchaseState.isPurchasing}
        onClose={() => setModalVisible(false)}
        onConfirm={() => purchaseViewModel.purchaseChapter()}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 16,
    padding: 32,
  },
  loadingText: { fontSize: 14, color: '#999' },
  errorText: { fontSize: 14, color: '#777', textAlign: 'center' },
  retryButton: {
    backgroundColor: '#D8708E',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerRight: { flexDirection: 'row' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 20 },
  mainInfoContainer: { flexDirection: 'row', marginTop: 10, marginBottom: 20 },
  coverImage: {
    width: 120,
    height: 170,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EBEF',
  },
  textInfoContainer: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 6, lineHeight: 28 },
  author: { fontSize: 14, color: '#777', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, color: '#555', fontWeight: '500' },
  matureBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matureBadgeText: { color: '#E53935', fontSize: 11, fontWeight: 'bold' },
  genresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  genreBadge: {
    backgroundColor: '#F5EBEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: { color: '#444', fontSize: 12, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 12 },
  synopsisText: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 30 },
  chaptersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sortText: { color: '#D8708E', fontSize: 14, fontWeight: '500' },
  chaptersList: { gap: 12 },
  emptyChapters: { alignItems: 'center', paddingVertical: 32 },
  emptyChaptersText: { color: '#999', fontSize: 13 },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE4EA',
    borderRadius: 16,
    padding: 12,
  },
  chapterIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FDF5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chapterDetails: { flex: 1 },
  chapterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
    marginRight: 8,
  },
  freeBadge: {
    backgroundColor: '#D4F5E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  freeBadgeText: { color: '#27A45C', fontSize: 10, fontWeight: '600' },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  coinBadgeText: { color: '#F5A623', fontSize: 11, fontWeight: 'bold' },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4F5E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  unlockedBadgeText: { color: '#27A45C', fontSize: 10, fontWeight: '600' },
  chapterSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chapterSubTextDate: { fontSize: 12, color: '#999' },
  bottomFixedArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  readButton: {
    flexDirection: 'row',
    backgroundColor: '#FF69B4',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readButtonDisabled: { backgroundColor: '#EECAD6' },
  readButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
