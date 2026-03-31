/**
 * MangaDetailScreen - Modal de detalle de manga
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { MangaDetailViewModel } from '@/src/features/manga/presentation';
import { ChapterItem } from '@/src/features/manga/presentation/components';
import { Tag } from '@/src/shared/components';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    position: 'relative',
    height: 200,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  thumb: {
    width: 70,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  titleBox: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.black,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  chapterBadge: {
    backgroundColor: COLORS.pink,
    color: '#fff',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 10,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 5,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  authorsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  author: {
    backgroundColor: '#FFD6EC',
    color: COLORS.pink,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  chaptersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chaptersTitle: {
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  coinBadge: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#333',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function MangaDetailScreen() {
  const router = useRouter();
  const { mangaId } = useLocalSearchParams<{ mangaId: string }>();
  const viewModel = serviceLocator.get<MangaDetailViewModel>(
    DIKeys.MANGA_DETAIL_VIEW_MODEL
  );
  const state = useStateFlow(viewModel.state$);

  useMVVM(
    async () => {
      if (mangaId) {
        await viewModel.loadMangaDetail(parseInt(mangaId));
      }
    },
    undefined
  );

  if (state.isLoading || !state.manga) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.pink} />
        </View>
      </View>
    );
  }

  const { manga } = state;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: manga.cover }} style={styles.cover} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={{ color: '#fff', fontSize: 18 }}>‹</Text>
          </TouchableOpacity>
          <View style={styles.overlay}>
            <Image source={{ uri: manga.cover }} style={styles.thumb} />
            <View style={styles.titleBox}>
              <Text style={styles.title}>{manga.title}</Text>
              <View style={styles.tagRow}>
                {manga.tags.map((tag: any) => (
                  <Tag key={tag} category={tag} />
                ))}
              </View>
              <Text style={styles.chapterBadge}>
                📖 {manga.chapters} Capítulos
              </Text>
            </View>
          </View>
        </View>

        {/* Authors */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Autor(es)</Text>
            <View style={styles.authorsRow}>
              {manga.authors.map((author: any) => (
                <Text key={author} style={styles.author}>
                  {author}
                </Text>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descripción</Text>
            <Text style={styles.description}>{manga.description}</Text>
          </View>
        </View>

        {/* Chapters */}
        <View style={styles.chaptersHeader}>
          <Text style={styles.chaptersTitle}>Capítulos</Text>
          <Text style={styles.coinBadge}>💰 50</Text>
        </View>

        {manga.chaptersData.map((chapter: any) => (
          <ChapterItem
            key={chapter.number}
            chapter={chapter}
            onPress={() => {
              // Handle chapter open
            }}
          />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
