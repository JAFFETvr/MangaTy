/**
 * CreatorBadge - Shows creator name badge inline
 */

import { colors } from '@/src/core/theme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Creator } from '../../domain/entities';

interface CreatorBadgeProps {
  creator: Creator;
  onPress?: () => void;
}

export const CreatorBadge: React.FC<CreatorBadgeProps> = ({ creator, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <Image
        source={{ uri: creator.avatar }}
        style={styles.avatar}
        contentFit="cover"
      />
      <Text style={styles.name}>{creator.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD6EC',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.pink,
  },
});
