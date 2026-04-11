import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { CreateChapterViewModel } from '../view-models/create-chapter-view-model';

interface Props {
  mangaId: string;
}

export default function CreateChapterScreen({ mangaId }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<CreateChapterViewModel>(() =>
    serviceLocator.get(DIKeys.CREATE_CHAPTER_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);

    if (state.success) {
      Alert.alert('¡Éxito!', 'Capítulo publicado correctamente', [
        { text: 'OK', onPress: () => {
          viewModel.reset();
          router.back();
        }}
      ]);
    }

    if (state.error) {
      Alert.alert('Error', state.error, [
        { text: 'OK', onPress: () => viewModel.resetError() }
      ]);
    }

    return unsubscribe;
  }, [state.success, state.error]);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultiple: true,
        quality: 0.8,
      });

      if (!result.cancelled) {
        for (const asset of result.assets || []) {
          if (asset.uri) {
            try {
              // Convertir imagen a base64 para persistencia
              const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              const dataUri = `data:image/jpeg;base64,${base64}`;
              viewModel.addImage(dataUri);
            } catch (error) {
              console.error('Error converting image to base64:', error);
              Alert.alert('Error', 'No se pudo procesar la imagen');
            }
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar las imágenes');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Capítulo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Título del Capítulo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: El comienzo de todo"
          placeholderTextColor="#999"
          value={state.title}
          onChangeText={(txt) => viewModel.setTitle(txt)}
        />

        <Text style={[styles.label, { marginTop: 24 }]}>Páginas del capítulo</Text>

        <TouchableOpacity
          style={styles.uploadArea}
          activeOpacity={0.8}
          onPress={pickImages}
        >
          <Feather name="upload" size={48} color="#D8708E" style={{ marginBottom: 12 }} />
          <Text style={styles.uploadTitle}>Subir páginas</Text>
          <Text style={styles.uploadSubtitle}>PNG, JPG - Múltiples archivos</Text>
        </TouchableOpacity>

        {state.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <View style={styles.imagesHeader}>
              <Text style={styles.imagesTitle}>{state.images.length} página{state.images.length !== 1 ? 's' : ''} seleccionada{state.images.length !== 1 ? 's' : ''}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesList}
            >
              {state.images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imageThumb} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => viewModel.removeImage(index)}
                  >
                    <Feather name="x" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />

        <TouchableOpacity
          style={[styles.publishButton, (!state.title || state.images.length === 0 || state.isLoading) && styles.publishButtonDisabled]}
          onPress={() => viewModel.publishChapter(mangaId)}
          disabled={!state.title || state.images.length === 0 || state.isLoading}
        >
          {state.isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.publishButtonText}>Publicar Capítulo</Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FDF0F3',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A2E',
  },
  uploadArea: {
    height: 300,
    backgroundColor: '#FDF0F3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F6D6DF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  imagesContainer: {
    marginTop: 20,
    backgroundColor: '#FEF8F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  imagesHeader: {
    marginBottom: 12,
  },
  imagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  imagesList: {
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageThumb: {
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButton: {
    backgroundColor: '#E2919E',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
