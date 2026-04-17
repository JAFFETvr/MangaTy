import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FreeChaptersViewModel } from '../view-models/free-chapters-view-model';

interface Props {
  slug: string;
  mangaId: string;
}

export default function FreeChaptersScreen({ slug, mangaId }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<FreeChaptersViewModel>(() =>
    serviceLocator.get(DIKeys.FREE_CHAPTERS_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());

  const goBackSafely = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(`/manage-webcomic/${mangaId}/access`);
  };

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadChapters(slug, mangaId);
    return unsubscribe;
  }, [slug, mangaId]);

  useEffect(() => {
    if (state.success) {
      if (Platform.OS === 'web') {
        viewModel.resetStatus();
        goBackSafely();
        return;
      }
      Alert.alert('Éxito', 'Configuración guardada correctamente', [
        { text: 'OK', onPress: () => {
          viewModel.resetStatus();
          goBackSafely();
        }}
      ]);
    }
    if (state.error) {
      if (Platform.OS === 'web') {
        viewModel.resetStatus();
        return;
      }
      Alert.alert('Error', state.error);
      viewModel.resetStatus();
    }
  }, [state.success, state.error]);

  if (state.isLoading && !state.manga) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D8708E" />
      </View>
    );
  }

  const chapters = state.manga?.chaptersData || [];
  const paidCount = state.paidChapterIds.length;
  const freeCount = Math.max(0, chapters.length - paidCount);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackSafely} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Seleccionar capítulos de pago</Text>
          <Text style={styles.headerSubtitle}>{state.manga?.title || 'Mi webcomic'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconCircle}>
            <Feather name="info" size={18} color="#D8708E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Configuración de capítulos</Text>
            <Text style={styles.infoDesc}>
              Por defecto todos los capítulos son gratuitos. Selecciona los capítulos que quieras convertir en de pago con monedas.
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
           <View style={styles.summaryCard}>
               <View style={styles.summaryLabelRow}>
                  <View style={[styles.dot, { backgroundColor: '#E2919E' }]} />
                  <Text style={styles.summaryLabel}>Capítulos de pago</Text>
                </View>
               <Text style={[styles.summaryValue, { color: '#E2919E' }]}>{paidCount}</Text>
            </View>
            <View style={styles.summaryCard}>
               <View style={styles.summaryLabelRow}>
                  <View style={[styles.dot, { backgroundColor: '#27AE60' }]} />
                  <Text style={styles.summaryLabel}>Capítulos gratuitos</Text>
               </View>
               <Text style={[styles.summaryValue, { color: '#27AE60' }]}>{freeCount}</Text>
            </View>
         </View>

        {/* Chapters List */}
        <View style={styles.chapterList}>
          {chapters.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="alert-triangle" size={48} color="#FF9800" style={{ marginBottom: 16 }} />
               <Text style={styles.emptyTitle}>No hay capítulos aún</Text>
               <Text style={styles.emptyDesc}>Debes publicar al menos un capítulo para configurar cuáles serán de pago con monedas.</Text>
             </View>
           ) : (
             chapters.map((ch) => {
              const isPaid = state.paidChapterIds.includes(ch.id);
              return (
                <TouchableOpacity 
                  key={ch.id} 
                  style={[styles.chapterItem, isPaid && styles.chapterItemFree]}
                  onPress={() => viewModel.toggleChapter(ch.id)}
                >
                  <View style={styles.chapterText}>
                    <View style={styles.titleRow}>
                      <Text style={styles.chapterTitle}>Capítulo {ch.chapterNumber}</Text>
                      {isPaid && (
                        <View style={styles.freeBadge}>
                           <Text style={styles.freeBadgeText}>De pago con monedas</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.chapterSubtitle}>{ch.title}</Text>
                  </View>
                  <View style={[styles.checkbox, isPaid && styles.checkboxSelected]}>
                    {isPaid && <Feather name="check" size={16} color="#FFF" />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Save Button */}
        {chapters.length > 0 && (
          <TouchableOpacity 
            style={[styles.saveButton, state.isSaving && styles.saveButtonDisabled]}
            onPress={() => viewModel.saveConfig(mangaId)}
            disabled={state.isSaving}
          >
            {state.isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar configuración</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9FA',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEEBED',
    marginBottom: 24,
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  chapterList: {
    gap: 12,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  chapterItemFree: {
    borderColor: '#27AE60',
    backgroundColor: '#F6FBF7',
  },
  chapterText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  freeBadge: {
    backgroundColor: '#E1F1E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  chapterSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFF9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#E2919E',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
