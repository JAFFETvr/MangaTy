/**
 * MangaDetailScreen - Modal de detalle de manga con sistema de desbloqueo
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { MangaDetailViewModel } from '@/src/features/manga/presentation';
import { MangaChaptersSection } from '@/src/features/unlocked-chapters/presentation';
import { CreatorBadge } from '@/src/features/creators/presentation';
import { Tag } from '@/src/shared/components';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Creator } from '@/src/features/creators/domain/entities';
import { GetCreatorById } from '@/src/features/creators/domain/use-cases';

const MOCK_USER_ID = 'user-1';
const INITIAL_BALANCE = 150; // Mock balance

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
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFD6EC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.pink,
  },
  buyButton: {
    backgroundColor: COLORS.pink,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
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
  const [userBalance, setUserBalance] = useState(INITIAL_BALANCE);
  const [creator, setCreator] = useState<Creator | null>(null);

  useMVVM(
    async () => {
      if (mangaId) {
        await viewModel.loadMangaDetail(parseInt(mangaId));
      }
    },
    undefined
  );

  // Load creator when manga loads
  useEffect(() => {
    const loadCreator = async () => {
      if (state.manga?.creatorId) {
        try {
          const getCreatorById = serviceLocator.get<GetCreatorById>(DIKeys.GET_CREATOR_BY_ID);
          const creatorData = await getCreatorById.execute(state.manga.creatorId);
          setCreator(creatorData);
        } catch (error) {
          console.log('Error loading creator:', error);
        }
      }
    };
    loadCreator();
  }, [state.manga?.creatorId]);

  const handleBalanceChange = (newBalance: number) => {
    setUserBalance(newBalance);
  };

  const handleBuyCoins = () => {
    router.push('/coin-store');
  };

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

        {/* Creator Badge */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Creador</Text>
            {creator ? (
              <CreatorBadge 
                creator={creator} 
                onPress={() => router.push(`/creators`)} 
              />
            ) : (
              <View style={styles.authorsRow}>
                <Text style={styles.author}>{manga.creatorId}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descripción</Text>
            <Text style={styles.description}>{manga.description}</Text>
          </View>
        </View>

        {/* Balance Bar */}
        <View style={styles.balanceBar}>
          <View style={styles.balanceLeft}>
            <Ionicons name="logo-bitcoin" size={18} color="#F5C518" />
            <Text style={styles.balanceText}>{userBalance} monedas</Text>
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={handleBuyCoins}>
            <Ionicons name="add-circle" size={14} color="#fff" />
            <Text style={styles.buyButtonText}>Comprar</Text>
          </TouchableOpacity>
        </View>

        {/* Chapters with Unlock */}
        <View style={{ paddingHorizontal: 16 }}>
          <MangaChaptersSection
            manga={manga}
            chapters={manga.chaptersData}
            userId={MOCK_USER_ID}
            userBalance={userBalance}
            onBalanceChange={handleBalanceChange}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
