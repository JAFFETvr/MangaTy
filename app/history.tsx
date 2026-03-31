/**
 * HistoryScreen - Modal de historial de lectura
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { HistoryViewModel } from '@/src/features/history/presentation';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { formatTimeAgo } from '@/src/shared/utils';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.pink,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.black,
    fontSize: TYPOGRAPHY.sizes['2xl'],
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: {
    width: 48,
    height: 62,
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  progress: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#FFD6EC',
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.pink,
  },
  continueBtn: {
    backgroundColor: COLORS.pink,
    color: '#fff',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 14,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 4,
  },
  trashBtn: {
    color: COLORS.textMuted,
    fontWeight: 'normal',
    fontSize: 16,
  },
  clearBtn: {
    marginHorizontal: 0,
    marginVertical: 8,
    borderWidth: 0,
    backgroundColor: '#fff',
    borderColor: '#B71C1C',
    borderRadius: 14,
    color: '#B71C1C',
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: TYPOGRAPHY.sizes.base,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default function HistoryScreen() {
  const router = useRouter();
  const viewModel = serviceLocator.get<HistoryViewModel>(DIKeys.HISTORY_VIEW_MODEL);
  const state = useStateFlow(viewModel.state$);

  useMVVM(
    async () => {
      await viewModel.loadHistory();
    },
    undefined
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🕐</Text>
          <Text style={styles.headerTitle}>Mi Historial</Text>
          <Text style={styles.headerSubtitle}>
            {state.history.length} manga(s) reciente(s)
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content}>
        {state.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.pink} />
          </View>
        ) : (
          <>
            {state.history.map((item) => (
              <View key={item.mangaId} style={styles.historyItem}>
                <Image
                  source={{ uri: item.manga.cover }}
                  style={styles.thumb}
                />
                <View style={styles.info}>
                  <Text style={styles.title}>{item.manga.title}</Text>
                  <Text style={styles.meta}>
                    🕐 {formatTimeAgo(item.timestamp)}
                  </Text>
                  <Text style={styles.meta}>
                    Capítulo {item.chapterNumber} · {item.progress}%
                  </Text>
                  <View style={styles.progress}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${item.progress}%` },
                      ]}
                    />
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.continueBtn}>Continuar</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Text style={styles.trashBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}

            {state.history.length > 0 && (
              <TouchableOpacity style={styles.clearBtn}>
                <Text style={{ color: '#B71C1C' }}>Borrar Todo el Historial</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
