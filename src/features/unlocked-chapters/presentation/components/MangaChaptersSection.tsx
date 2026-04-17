/**
 * MangaChaptersScreen - Enhanced chapter list with unlock functionality
 */

import { Chapter, Manga } from '@/src/features/manga/domain/entities';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { UnlockChapterViewModel } from '../view-models';
import { ChapterListItem } from './ChapterListItem';

interface MangaChaptersScreenProps {
  manga: Manga;
  chapters: Chapter[];
  userId: string;
  userBalance: number;
  onBalanceChange: (newBalance: number) => void;
}

export const MangaChaptersSection: React.FC<MangaChaptersScreenProps> = ({
  manga,
  chapters,
  userId,
  userBalance,
  onBalanceChange,
}) => {
  const router = useRouter();
  const [viewModel] = useState(() => new UnlockChapterViewModel());
  const [state, setState] = useState(viewModel.getState());
  const [localBalance, setLocalBalance] = useState(userBalance);

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    
    // Check which chapters are unlocked
    chapters.forEach(chapter => {
      if (chapter.price > 0) {
        viewModel.checkUnlocked(userId, manga.id, chapter.number);
      }
    });
    
    return unsubscribe;
  }, [manga.id, chapters]);

  useEffect(() => {
    setLocalBalance(userBalance);
  }, [userBalance]);

  const handleUnlock = async (chapterNumber: number, cost: number) => {
    const result = await viewModel.unlockChapter(
      userId,
      manga.id,
      chapterNumber,
      manga.creatorId,
      cost
    );

    if (result.success) {
      setLocalBalance(result.newBalance);
      onBalanceChange(result.newBalance);
      Alert.alert(
        '¡Capítulo Desbloqueado!',
        `Has desbloqueado el Capítulo ${chapterNumber}.\nBalance: ${result.newBalance} monedas`,
        [{ text: 'Leer Ahora', onPress: () => handleRead(chapterNumber) }]
      );
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleRead = (chapterNumber: number) => {
    router.push(`/reader/${manga.id}/${chapterNumber}`);
  };

  const handleBuyCoins = () => {
    router.push('/(tabs)/coins');
  };

  const isChapterUnlocked = (chapterNumber: number): boolean => {
    const chapter = chapters.find(c => c.number === chapterNumber);
    if (!chapter || chapter.price === 0) return true;
    return state.unlockedChapters[`${manga.id}-${chapterNumber}`] || false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Capítulos</Text>
        <Text style={styles.subtitle}>{chapters.length} capítulos</Text>
      </View>

      {chapters.map((chapter) => (
        <ChapterListItem
          key={chapter.number}
          chapter={chapter}
          mangaId={manga.id}
          creatorId={manga.creatorId}
          userId={userId}
          userBalance={localBalance}
          isUnlocked={isChapterUnlocked(chapter.number)}
          isUnlocking={state.isUnlocking}
          onUnlock={handleUnlock}
          onRead={handleRead}
          onBuyCoins={handleBuyCoins}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
  },
});

export default MangaChaptersSection;
