import { buildCoverUrl } from '@/src/core/api/api-config';
import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GENRE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Drama': { bg: '#F3E5F5', text: '#8E24AA', border: '#E1BEE7' },
  'Romance': { bg: '#FCE4EC', text: '#D81B60', border: '#F8BBD0' },
  'Acción': { bg: '#FFEBEE', text: '#E53935', border: '#FFCDD2' },
  'Comedia': { bg: '#FFF3E0', text: '#F57C00', border: '#FFE0B2' },
  'BL': { bg: '#E1F5FE', text: '#039BE5', border: '#B3E5FC' },
  'GL': { bg: '#FCE4EC', text: '#D81B60', border: '#F8BBD0' },
  'Fantasía': { bg: '#EDE7F6', text: '#5E35B1', border: '#D1C4E9' },
  'Misterio': { bg: '#ECEFF1', text: '#546E7A', border: '#CFD8DC' },
  'Omegaverse': { bg: '#F3E5F5', text: '#8E24AA', border: '#E1BEE7' },
  'Historical': { bg: '#EFEBE9', text: '#6D4C41', border: '#D7CCC8' },
  'Horror': { bg: '#FFEBEE', text: '#E53935', border: '#FFCDD2' },
  'Informativo': { bg: '#E0F7FA', text: '#00ACC1', border: '#B2EBF2' },
  'Sobrenatural': { bg: '#EDE7F6', text: '#5E35B1', border: '#D1C4E9' },
  'Superhero': { bg: '#E8EAF6', text: '#3949AB', border: '#C5CAE9' },
  'Vida Cotidiana': { bg: '#F1F8E9', text: '#7CB342', border: '#DCEDC8' },
  default: { bg: '#FDF5F7', text: '#D8708E', border: '#F6E9EB' }
};

export default function MyWebcomicsScreen() {
  const insets = useSafeAreaInsets();
  const [webcomics, setWebcomics] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadWebcomics = async () => {
        try {
          const token = await TokenStorageService.getToken();
          if (!token) {
            setWebcomics([]);
            return;
          }
          httpClient.setToken(token);

          const response = await httpClient.get<any>('/comics/me?page=0&size=100&sort=createdAt,desc');
          const list: any[] = Array.isArray(response)
            ? response
            : (response.content ?? response.data ?? []);

          setWebcomics(
            list.map((item: any) => ({
              id: item.id,
              slug: item.slug,
              title: item.title,
              description: item.synopsis ?? '',
              genres: item.genre ? [item.genre] : [],
              coverImage: item.coverImagePath ? buildCoverUrl(item.coverImagePath) : '',
            })),
          );
        } catch (error) {
          console.error('❌ Error loading webcomics:', error);
          setWebcomics([]);
        }
      };
      loadWebcomics();
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Webcomics</Text>
        </View>

        <TouchableOpacity 
          style={styles.newButton} 
          onPress={() => router.push('/create-webcomic')}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.newButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Webcomics */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {webcomics.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.webcomicCard} 
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/manage-webcomic/[id]',
              params: { id: item.id, slug: item.slug || item.id }
            })}
          >
            
            {/* Box Placeholder de la portada */}
            {item.coverImage ? (
              <Image source={{ uri: item.coverImage }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverPlaceholderText}>Sin portada</Text>
              </View>
            )}

            {/* Info del Webcomic */}
            <View style={styles.infoContainer}>
              <Text style={styles.webcomicTitle} numberOfLines={1}>
                {item.title}
              </Text>
              
              {/* Badges de géneros */}
              <View style={styles.badgesRow}>
                {item.genres.map((genre: string) => {
                  const colors = GENRE_COLORS[genre] || GENRE_COLORS.default;
                  return (
                    <View key={genre} style={[styles.genreBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <Text style={[styles.genreBadgeText, { color: colors.text }]}>{genre}</Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.webcomicDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            
          </TouchableOpacity>
        ))}

        {webcomics.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="layers" size={40} color="#E0C4CC" />
            <Text style={styles.emptyStateText}>Aún no has creado ningún webcomic.</Text>
          </View>
        )}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8708E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  webcomicCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  coverPlaceholder: {
    width: 90,
    height: 135, // Proporción 2:3
    backgroundColor: '#F5EBEF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  coverPlaceholderText: {
    fontSize: 12,
    color: '#777',
  },
  coverImage: {
    width: 90,
    height: 135,
    borderRadius: 12,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    paddingTop: 4,
  },
  webcomicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  genreBadge: {
    backgroundColor: '#FDF5F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F6E9EB',
  },
  genreBadgeText: {
    fontSize: 11,
    color: '#D8708E',
    fontWeight: '500',
  },
  moreBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreBadgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  webcomicDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
});
