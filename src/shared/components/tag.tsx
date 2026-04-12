/**
 * Tag Component - Display category tags for manga
 */

import { COLORS, TagCategory } from '@/src/core/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TagProps {
  category: TagCategory;
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export function Tag({ category }: TagProps): React.ReactElement {
  const colors = COLORS.tagColors[category];

  return (
    <View style={[styles.tag, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{category}</Text>
    </View>
  );
}
