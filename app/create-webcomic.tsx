/**
 * CreateWebcomicScreen - Crear nuevo webcomic
 */

import { COLORS } from '@/src/core/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const GENRES = [
  'Romance',
  'GL',
  'BL',
  'Acción',
  'Comedia',
  'Drama',
  'Misterio',
  'Thriller',
  'Fantasía',
  'Harem',
  'Mahimamia',
  'Sobrenatural',
  'Superhero',
  'Vida Cotidiana',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  uploadBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genreButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genreText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  genreTextActive: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flexDirection: 'row',
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '700',
  },
});

export default function CreateWebcomicScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleCreate = () => {
    if (!title.trim()) {
      alert('Por favor ingresa un título');
      return;
    }
    if (selectedGenres.length === 0) {
      alert('Por favor selecciona al menos un género');
      return;
    }
    // TODO: Implementar creación de webcomic
    alert(`Webcomic creado: ${title}\nGéneros: ${selectedGenres.join(', ')}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Webcomic</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Portada del Webcomic */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Portada del Webcomic</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>📁</Text>
            <Text style={styles.uploadText}>Sube aquí</Text>
            <Text style={styles.uploadSubtext}>PDF, 451 fotos +más</Text>
          </TouchableOpacity>
        </View>

        {/* Título del Webcomic */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Título del Webcomic</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Mi Manga Increíble"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Descripción</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe tu historia..."
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Géneros */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Géneros Más usado R</Text>
          <View style={styles.genreGrid}>
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreButton,
                  selectedGenres.includes(genre) && styles.genreButtonActive,
                ]}
                onPress={() => toggleGenre(genre)}
              >
                <Text
                  style={[
                    styles.genreText,
                    selectedGenres.includes(genre) && styles.genreTextActive,
                  ]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Crear Webcomic</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
