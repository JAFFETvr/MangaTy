import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TokenStorageService } from '@/src/core/http/token-storage-service';

interface Props {
  mangaId: string;
  chapterId: string;
}

interface ChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  pages: string[];
  publishedAt: string;
  premium: boolean;
  priceTyCoins: number;
}

export default function ChapterViewerScreen({ mangaId, chapterId }: Props) {
  const insets = useSafeAreaInsets();
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    loadChapter();
  }, [mangaId, chapterId]);

  const loadChapter = async () => {
    try {
      setIsLoading(true);
      const userId = await TokenStorageService.getUserId();
      if (!userId) {
        throw new Error('No se pudo obtener el usuario');
      }

      const storageKey = `@mangaty_${userId}_webcomics`;
      const storedStr = await AsyncStorage.getItem(storageKey);
      if (!storedStr) {
        throw new Error('Comic no encontrado');
      }

      const webcomics = JSON.parse(storedStr);
      const comic = webcomics.find((w: any) => w.id === mangaId);

      if (!comic) {
        throw new Error('Comic no encontrado');
      }

      const foundChapter = comic.chapters.find((c: any) => c.id === chapterId);
      if (!foundChapter) {
        throw new Error('Capítulo no encontrado');
      }

      setChapter(foundChapter);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cargar el capítulo');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D8708E" />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.container}>
        <Text>Capítulo no encontrado</Text>
      </View>
    );
  }

  const currentPage = chapter.pages[currentPageIndex];
  const totalPages = chapter.pages.length;
  const hasNextPage = currentPageIndex < totalPages - 1;
  const hasPrevPage = currentPageIndex > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.chapterTitle}>Capítulo {chapter.chapterNumber}</Text>
          <Text style={styles.chapterSubtitle}>{chapter.title}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Page Counter */}
      <View style={styles.pageCounter}>
        <Text style={styles.pageCountText}>
          Página {currentPageIndex + 1} de {totalPages}
        </Text>
      </View>

      {/* Page Viewer */}
      <View style={styles.imageContainer}>
        {currentPage ? (
          <Image source={{ uri: currentPage }} style={styles.pageImage} />
        ) : (
          <View style={styles.noPageContainer}>
            <Feather name="image" size={48} color="#CCC" />
            <Text style={styles.noPageText}>No hay imagen</Text>
          </View>
        )}
      </View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, !hasPrevPage && styles.navButtonDisabled]}
          onPress={() => setCurrentPageIndex(prev => prev - 1)}
          disabled={!hasPrevPage}
        >
          <Feather name="chevron-left" size={24} color={hasPrevPage ? '#D8708E' : '#CCC'} />
          <Text style={[styles.navButtonText, !hasPrevPage && styles.navButtonTextDisabled]}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !hasNextPage && styles.navButtonDisabled]}
          onPress={() => setCurrentPageIndex(prev => prev + 1)}
          disabled={!hasNextPage}
        >
          <Text style={[styles.navButtonText, !hasNextPage && styles.navButtonTextDisabled]}>Siguiente</Text>
          <Feather name="chevron-right" size={24} color={hasNextPage ? '#D8708E' : '#CCC'} />
        </TouchableOpacity>
      </View>

      {/* Thumbnail Strip */}
      {totalPages > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsList}
        >
          {chapter.pages.map((page, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.thumbnail, index === currentPageIndex && styles.thumbnailActive]}
              onPress={() => setCurrentPageIndex(index)}
            >
              <Image source={{ uri: page }} style={styles.thumbnailImage} />
              <Text style={styles.thumbnailNumber}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  pageCounter: {
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pageCountText: {
    color: '#D8708E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  noPageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  noPageText: {
    color: '#666',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#222',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#333',
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navButtonTextDisabled: {
    color: '#666',
  },
  thumbnailsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  thumbnailActive: {
    borderColor: '#D8708E',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailNumber: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
