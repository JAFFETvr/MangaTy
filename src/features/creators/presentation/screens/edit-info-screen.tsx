import { buildCoverUrl } from '@/src/core/api/api-config';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AVAILABLE_GENRES, EditWebcomicViewModel } from '../view-models/edit-webcomic-view-model';

interface Props {
  slug: string;
  mangaId: string;
}

const resolveImageUri = (value: string | null | undefined): string => {
  if (!value) return '';
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('file://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }
  return buildCoverUrl(value);
};

const blurActiveElementOnWeb = () => {
  if (Platform.OS !== 'web') return;
  const active = (globalThis as any)?.document?.activeElement as { blur?: () => void } | null;
  active?.blur?.();
};

export default function EditInfoScreen({ slug, mangaId }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<EditWebcomicViewModel>(() =>
    serviceLocator.get(DIKeys.EDIT_WEBCOMIC_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());

  // TODOS LOS HOOKS DEBEN IR AQUÍ, ANTES DE CUALQUIER EARLY RETURN
  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadWebcomic(slug, mangaId);
    return () => {
      unsubscribe();
    };
  }, [slug, mangaId, viewModel]);

  useEffect(() => {
    if (state.success) {
      if (Platform.OS === 'web') {
        viewModel.resetStatus();
        blurActiveElementOnWeb();
        router.back();
        return;
      }
      Alert.alert('Éxito', 'Cambios guardados correctamente', [
        { text: 'OK', onPress: () => {
          viewModel.resetStatus();
          router.back();
        }}
      ]);
    }
    if (state.error) {
      if (Platform.OS === 'web') {
        console.error('❌ Error editando comic:', state.error);
        viewModel.resetStatus();
        return;
      }
      Alert.alert('Error', state.error);
      viewModel.resetStatus();
    }
  }, [state.success, state.error]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      viewModel.setBannerImage(result.assets[0].uri);
    }
  };

  // AHORA sí puede haber early return después de todos los hooks
  if (state.isLoading && !state.manga) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D8708E" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            blurActiveElementOnWeb();
            router.back();
          }}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Editar información</Text>
          <Text style={styles.headerSubtitle}>{state.manga?.title || 'Webcomic'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cover Section */}
        <Text style={styles.sectionLabel}>Portada del webcomic</Text>
        <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
          {state.form.bannerImage ? (
            <Image 
              source={{ uri: resolveImageUri(state.form.bannerImage) }} 
              style={styles.coverPreview} 
            />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Feather name="image" size={48} color="#D8708E" />
              <Text style={styles.uploadTitle}>Subir portada</Text>
              <Text style={styles.uploadSubtitle}>Formatos: JPG, PNG • Máx. 5MB</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title Input */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Título del webcomic <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={state.form.title}
          onChangeText={(txt) => viewModel.setTitle(txt)}
          placeholder="Título del webcomic"
        />
        <Text style={styles.charCount}>{state.form.title.length}/100 caracteres</Text>

        {/* Description Input */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Descripción <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={state.form.description}
          onChangeText={(txt) => viewModel.setDescription(txt)}
          placeholder="Describe de qué trata tu webcomic..."
          multiline
          numberOfLines={4}
        />
        <Text style={styles.charCount}>{state.form.description.length}/500 caracteres</Text>

        {/* Genres Selection */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Géneros <Text style={styles.required}>*</Text></Text>
        <Text style={styles.genreTip}>Selecciona hasta 3 géneros</Text>
        
        <View style={styles.genreCloud}>
          {AVAILABLE_GENRES.map((g) => {
            const isSelected = state.form.selectedGenres.includes(g);
            return (
              <TouchableOpacity 
                key={g} 
                style={[styles.genreTag, isSelected && styles.genreTagSelected]}
                onPress={() => viewModel.toggleGenre(g)}
              >
                <Text style={[styles.genreText, isSelected && styles.genreTextSelected]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.charCount}>{state.form.selectedGenres.length}/3 géneros seleccionados</Text>

        {/* Selected Genres Summary */}
        <View style={styles.selectedSummary}>
           <Text style={styles.summaryTitle}>Géneros seleccionados:</Text>
           <View style={styles.summaryRow}>
             {state.form.selectedGenres.map(g => (
               <View key={g} style={styles.summaryTag}>
                 <Text style={styles.summaryTagText}>{g}</Text>
                 <TouchableOpacity onPress={() => viewModel.toggleGenre(g)}>
                   <Feather name="x" size={14} color="#D8708E" />
                 </TouchableOpacity>
               </View>
             ))}
           </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              blurActiveElementOnWeb();
              router.back();
            }}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, state.isSaving && styles.saveButtonDisabled]}
            onPress={() => viewModel.saveChanges()}
            disabled={state.isSaving}
          >
            {state.isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  required: {
    color: '#D8708E',
  },
  uploadArea: {
    width: '100%',
    height: 320,
    backgroundColor: '#FDF0F3',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  input: {
    backgroundColor: '#FDF0F3',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A2E',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  genreTip: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  genreCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  genreTagSelected: {
    backgroundColor: '#E2919E',
    borderColor: '#E2919E',
  },
  genreText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genreTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedSummary: {
    marginTop: 24,
    backgroundColor: '#FEF8F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF0F3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F6D6DF',
  },
  summaryTagText: {
    color: '#D8708E',
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F0F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1.2,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E2919E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
