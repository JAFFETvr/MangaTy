/**
 * MyWebcomicsScreen - Gestionar webcomics del usuario
 * Si no tiene webcomics, redirige a crear
 * Si tiene, muestra la lista
 */

import { COLORS } from '@/src/core/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Webcomic {
  id: string;
  title: string;
  description: string;
  cover: string;
  createdAt: Date;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  newButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  webcomicCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  coverImage: {
    width: 80,
    height: 100,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverText: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginTop: 4,
    lineHeight: 16,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

// Mock data - en producción vendría del servidor
const MOCK_WEBCOMICS: Webcomic[] = [
  {
    id: '1',
    title: 'Webcomic nuevo',
    description: 'Aquí no paso nada 🖤',
    cover: 'https://via.placeholder.com/80x100',
    createdAt: new Date(),
  },
];

const HAS_WEBCOMIC = true; // Cambiar a false para ver la vista vacía

export default function MyWebcomicsScreen() {
  const router = useRouter();
  const [webcomics, setWebcomics] = useState<Webcomic[]>(MOCK_WEBCOMICS);

  useEffect(() => {
    // Si no tiene webcomics, redirigir a crear
    if (webcomics.length === 0 && !HAS_WEBCOMIC) {
      router.replace('/create-webcomic');
    }
  }, []);

  const handleNewWebcomic = () => {
    router.push('/create-webcomic');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Webcomics</Text>
        </View>
        <TouchableOpacity style={styles.newButton} onPress={handleNewWebcomic}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.newButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {webcomics.length > 0 ? (
          webcomics.map((webcomic) => (
            <TouchableOpacity 
              key={webcomic.id}
              style={styles.webcomicCard}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.coverImage}>
                  <Text style={styles.coverText}>sin portada</Text>
                </View>

                <View style={styles.cardInfo}>
                  <View>
                    <Text style={styles.cardTitle}>{webcomic.title}</Text>
                    <Text style={styles.cardDescription}>
                      {webcomic.description}
                    </Text>
                  </View>
                  <View style={styles.cardStats}>
                    <View style={styles.statBadge}>
                      <Text style={styles.statText}>0 Capítulos</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statText}>0 Lectores</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>
              No tienes webcomics aún{'\n'}
              ¡Crea uno ahora!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
