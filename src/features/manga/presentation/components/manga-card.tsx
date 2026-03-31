/**
 * MangaCard Component - Individual manga card for grid display
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { Tag } from '@/src/shared/components';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Manga } from '../../domain/entities';

interface MangaCardProps {
  manga: Manga;
  onPress: (manga: Manga) => void;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cover: {
    width: '100%',
    height: 150,
  },
  info: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  chapCount: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
});

export function MangaCard({ manga, onPress }: MangaCardProps): React.ReactElement {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(manga)}>
      <Image source={{ uri: manga.cover }} style={styles.cover} />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {manga.title}
        </Text>
        <View style={styles.tagRow}>
          {manga.tags.map((tag) => (
            <Tag key={tag} category={tag} />
          ))}
        </View>
        <Text style={styles.chapCount}>{manga.chapters} cap.</Text>
      </View>
    </TouchableOpacity>
  );
}
