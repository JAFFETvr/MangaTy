import { buildCoverUrl } from '@/src/core/api/api-config';
import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { loadPublicWebcomics } from '@/src/core/storage/local-webcomic-storage';
import {
  getMangaRestrictionMessageWithAdultPreference,
  loadAdultContentPreference,
  loadMangaAccessConfig,
} from '@/src/core/storage/manga-access-storage';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  mangaId: string;
  chapterId: string;
  isPremium?: boolean;
}

interface ReaderState {
  title: string;
  chapterNumber: number;
  pages: string[];
}

const mapPage = (value: string): string => {
  if (value.startsWith('data:') || value.startsWith('file://') || value.startsWith('blob:') || value.startsWith('http')) {
    return value;
  }
  return buildCoverUrl(value);
};

const extractPages = (chapter: any): string[] => {
  const rawPages =
    chapter?.pages ??
    chapter?.images ??
    chapter?.pageUrls ??
    chapter?.pageImagePaths ??
    [];

  if (!Array.isArray(rawPages)) return [];
  return rawPages.filter((p) => typeof p === 'string').map(mapPage);
};

const extractRemotePageUrls = (payload: any): string[] => {
  const rawPages = Array.isArray(payload)
    ? payload
    : (payload?.content ?? payload?.data ?? payload?.pages ?? []);

  if (!Array.isArray(rawPages)) return [];

  return rawPages
    .map((page: any) => {
      if (typeof page === 'string') return mapPage(page);
      const path = page?.imagePath ?? page?.url ?? page?.imageUrl ?? page?.path;
      return typeof path === 'string' ? mapPage(path) : null;
    })
    .filter((page: string | null): page is string => Boolean(page));
};

export default function ChapterReaderScreen({ mangaId, chapterId, isPremium = false }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ReaderState | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isPremium) {
          throw new Error('Este capítulo es de pago. Debes desbloquearlo con monedas para leerlo.');
        }

        const [role, config] = await Promise.all([
          TokenStorageService.getRole(),
          loadMangaAccessConfig(mangaId),
        ]);
        const allowsAdultContent = await loadAdultContentPreference();
        const restrictionMessage = getMangaRestrictionMessageWithAdultPreference(
          config,
          role,
          allowsAdultContent,
        );
        if (restrictionMessage) {
          throw new Error(restrictionMessage);
        }

        // 1) Capítulo local (creadores)
        const localComics = await loadPublicWebcomics();
        const localComic = localComics.find((comic: any) => String(comic.id) === String(mangaId));
        const localChapter = localComic?.chapters?.find((ch: any) => String(ch.id) === String(chapterId));
        if (localChapter) {
          const localPages = extractPages(localChapter);
          if (localPages.length > 0) {
            setState({
              title: localChapter.title || 'Capítulo',
              chapterNumber: localChapter.chapterNumber || 1,
              pages: localPages,
            });
            setLoading(false);
            return;
          }
        }

        // 2) Capítulo remoto (API documentada)
        const listResponse = await httpClient.get<any>(`/comics/${mangaId}/chapters`);
        const chapterList = Array.isArray(listResponse)
          ? listResponse
          : (listResponse?.content ?? listResponse?.data ?? listResponse?.chapters ?? []);
        const remoteChapter = chapterList.find((ch: any) => String(ch.id) === String(chapterId));

        const pagesResponse = await httpClient.get<any>(`/comics/${mangaId}/chapters/${chapterId}/pages`);
        const remotePages = extractRemotePageUrls(pagesResponse);
        if (remotePages.length === 0) {
          throw new Error('Este capítulo no tiene páginas disponibles');
        }

        setState({
          title: remoteChapter?.title || 'Capítulo',
          chapterNumber: remoteChapter?.chapterNumber || 1,
          pages: remotePages,
        });
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar el capítulo');
      } finally {
        setLoading(false);
      }
    };

    if (!mangaId || !chapterId) {
      setError('Parámetros inválidos para abrir el capítulo');
      setLoading(false);
      return;
    }

    void load();
  }, [mangaId, chapterId, isPremium]);

  const pageCount = useMemo(() => state?.pages.length || 0, [state?.pages.length]);
  const pageUri = state?.pages[currentPage];

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D8708E" />
      </View>
    );
  }

  if (error || !state) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Feather name="alert-circle" size={40} color="#E0C4CC" />
        <Text style={styles.errorText}>{error || 'No se pudo cargar el capítulo'}</Text>
        <TouchableOpacity style={styles.backAction} onPress={() => router.back()}>
          <Text style={styles.backActionText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Cap. {state.chapterNumber}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{state.title}</Text>
        </View>
        <Text style={styles.pageCounter}>{currentPage + 1}/{pageCount}</Text>
      </View>

      <View style={styles.imageWrapper}>
        {pageUri ? (
          <Image source={{ uri: pageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.errorText}>Página no disponible</Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentPage === 0 && styles.controlButtonDisabled]}
          disabled={currentPage === 0}
          onPress={() => setCurrentPage((p) => p - 1)}
        >
          <Feather name="chevron-left" size={20} color="#FFF" />
          <Text style={styles.controlText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, currentPage >= pageCount - 1 && styles.controlButtonDisabled]}
          disabled={currentPage >= pageCount - 1}
          onPress={() => setCurrentPage((p) => p + 1)}
        >
          <Text style={styles.controlText}>Siguiente</Text>
          <Feather name="chevron-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  headerSubtitle: {
    color: '#AAA',
    fontSize: 12,
  },
  pageCounter: {
    color: '#D8708E',
    fontWeight: '700',
    fontSize: 12,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  controlButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#D8708E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlText: {
    color: '#FFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#DDD',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  backAction: {
    marginTop: 16,
    backgroundColor: '#D8708E',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backActionText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
