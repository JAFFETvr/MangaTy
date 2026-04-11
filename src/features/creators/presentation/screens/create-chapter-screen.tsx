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
        { text: 'OK', onPress: () => router.back() }
      ]);
      viewModel.reset();
    }

    if (state.error) {
      Alert.alert('Error', state.error);
    }

    return unsubscribe;
  }, [state.success, state.error]);

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
        >
          <Feather name="upload" size={48} color="#D8708E" style={{ marginBottom: 12 }} />
          <Text style={styles.uploadTitle}>Subir páginas</Text>
          <Text style={styles.uploadSubtitle}>PNG, JPG - Múltiples archivos</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />

        <TouchableOpacity 
          style={[styles.publishButton, (!state.title || state.isLoading) && styles.publishButtonDisabled]}
          onPress={() => viewModel.publishChapter(mangaId)}
          disabled={state.isLoading}
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
