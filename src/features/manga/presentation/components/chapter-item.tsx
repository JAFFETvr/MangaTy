/**
 * ChapterItem Component - Displays a single chapter in detail view
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chapter } from '../../domain/entities';

interface ChapterItemProps {
  chapter: Chapter;
  onPress: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  chapterNumber: {
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  freeLabel: {
    color: COLORS.textMuted,
  },
  paidLabel: {
    color: COLORS.pink,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  price: {
    color: COLORS.pink,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});

export function ChapterItem({
  chapter,
  onPress,
}: ChapterItemProps): React.ReactElement {
  const isFree = chapter.price === 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.icon}>{isFree ? '👁️' : '🔒'}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.chapterNumber}>Capítulo {chapter.number}</Text>
          <Text
            style={[
              styles.label,
              isFree ? styles.freeLabel : styles.paidLabel,
            ]}
          >
            {chapter.label}
          </Text>
        </View>
      </View>
      {!isFree && <Text style={styles.price}>{chapter.price}</Text>}
    </TouchableOpacity>
  );
}
