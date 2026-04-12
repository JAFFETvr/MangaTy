/**
 * ChapterListItem - Enhanced chapter item with unlock functionality
 */

import { colors } from '@/src/core/theme';
import { Chapter } from '@/src/features/manga/domain/entities';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { UnlockChapterButton } from './UnlockChapterButton';

interface ChapterListItemProps {
  chapter: Chapter;
  mangaId: number;
  creatorId: string;
  userId: string;
  userBalance: number;
  isUnlocked: boolean;
  isUnlocking: boolean;
  onUnlock: (chapterNumber: number, cost: number) => Promise<void>;
  onRead: (chapterNumber: number) => void;
  onBuyCoins: () => void;
}

export const ChapterListItem: React.FC<ChapterListItemProps> = ({
  chapter,
  mangaId,
  creatorId,
  userId,
  userBalance,
  isUnlocked,
  isUnlocking,
  onUnlock,
  onRead,
  onBuyCoins,
}) => {
  const isFree = chapter.price === 0;
  const canRead = isFree || isUnlocked;

  const handleUnlock = async () => {
    await onUnlock(chapter.number, chapter.price);
  };

  const handlePress = () => {
    if (canRead) {
      onRead(chapter.number);
    } else {
      Alert.alert(
        'Capítulo Bloqueado',
        `Este capítulo cuesta ${chapter.price} monedas. ¿Deseas desbloquearlo?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Desbloquear', onPress: handleUnlock },
        ]
      );
    }
  };

  const handleInsufficientCoins = () => {
    Alert.alert(
      'Monedas Insuficientes',
      `Necesitas ${chapter.price} monedas pero solo tienes ${userBalance}. ¿Deseas comprar más monedas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar Monedas', onPress: onBuyCoins },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, canRead ? styles.iconUnlocked : styles.iconLocked]}>
          <Ionicons
            name={canRead ? 'book' : 'lock-closed'}
            size={18}
            color={canRead ? colors.pink : '#888'}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.chapterTitle}>Capítulo {chapter.number}</Text>
          <Text style={[styles.label, isFree && styles.labelFree]}>
            {isFree ? 'Gratis' : isUnlocked ? 'Desbloqueado' : chapter.label}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {!isFree && !isUnlocked && (
          <UnlockChapterButton
            chapterNumber={chapter.number}
            cost={chapter.price}
            userBalance={userBalance}
            isUnlocked={isUnlocked}
            isUnlocking={isUnlocking}
            onUnlock={handleUnlock}
            onInsufficientCoins={handleInsufficientCoins}
          />
        )}
        {(isFree || isUnlocked) && (
          <View style={styles.readButton}>
            <Text style={styles.readText}>Leer</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.pink} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconUnlocked: {
    backgroundColor: '#FFD6EC',
  },
  iconLocked: {
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  labelFree: {
    color: colors.pink,
    fontWeight: '600',
  },
  rightSection: {
    marginLeft: 12,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readText: {
    color: colors.pink,
    fontWeight: '600',
    fontSize: 14,
  },
});
