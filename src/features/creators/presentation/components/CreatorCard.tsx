/**
 * CreatorCard - Displays creator info with avatar and stats
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Creator } from '../../domain/entities';

interface CreatorCardProps {
  creator: Creator;
  onPress?: () => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <Image
        source={{ uri: creator.avatar }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{creator.name}</Text>
        <Text style={styles.bio} numberOfLines={2}>{creator.bio}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="people" size={14} color="#888" />
            <Text style={styles.statText}>{creator.stats.followers}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="book" size={14} color="#888" />
            <Text style={styles.statText}>{creator.stats.mangasPublished}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  bio: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
});
