import { StateFlow } from '@/src/shared/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { TokenStorageService } from '@/src/core/http/token-storage-service';

export interface CreateChapterState {
  title: string;
  images: string[];
  isLoading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: CreateChapterState = {
  title: '',
  images: [],
  isLoading: false,
  success: false,
  error: null,
};

export class CreateChapterViewModel {
  private stateSubject = new StateFlow<CreateChapterState>(initialState);
  state$ = this.stateSubject;

  getState() {
    return this.stateSubject.getValue();
  }

  setTitle(title: string) {
    this.updateState({ title });
  }

  addImage(uri: string) {
    const current = this.getState().images;
    this.updateState({ images: [...current, uri] });
  }

  removeImage(index: number) {
    const current = [...this.getState().images];
    current.splice(index, 1);
    this.updateState({ images: current });
  }

  async publishChapter(mangaId: string) {
    const { title, images } = this.getState();
    if (!title || images.length === 0) {
      this.updateState({ error: 'Por favor completa el título y sube al menos una página' });
      return;
    }

    this.updateState({ isLoading: true, error: null });

    try {
      console.log('📝 Publicando capítulo para mangaId:', mangaId);

      const userId = await TokenStorageService.getUserId();
      if (!userId) {
        throw new Error('No se pudo obtener el usuario');
      }

      // Convertir imágenes a base64 para persistencia
      const persistedImages: string[] = [];
      for (const imageUri of images) {
        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
          });
          persistedImages.push(`data:image/jpeg;base64,${base64}`);
        } catch (error) {
          console.error('Error converting image:', error);
          // Si falla la conversión, usar el URI original
          persistedImages.push(imageUri);
        }
      }

      // Obtener webcomics del cache local con clave del usuario
      const storageKey = `@mangaty_${userId}_webcomics`;
      const storedStr = await AsyncStorage.getItem(storageKey);
      if (!storedStr) {
        throw new Error('Comic no encontrado - almacenamiento vacío');
      }

      const webcomics = JSON.parse(storedStr);
      console.log('📚 Comics encontrados:', webcomics.length);

      const comicIndex = webcomics.findIndex((w: any) => w.id === mangaId);
      console.log('🔍 Comic encontrado en índice:', comicIndex);

      if (comicIndex === -1) {
        throw new Error(`Comic no encontrado - ID buscado: ${mangaId}`);
      }

      // Crear nuevo capítulo CON IMÁGENES PERSISTIDAS
      const newChapter = {
        id: `chapter-${Date.now()}`,
        chapterNumber: (webcomics[comicIndex].chapters?.length || 0) + 1,
        title: title,
        premium: false,
        priceTyCoins: 0,
        publishedAt: new Date().toISOString(),
        pages: persistedImages, // Usar imágenes en base64
      };

      console.log('✍️ Nuevo capítulo creado con', persistedImages.length, 'páginas');

      // Agregar capítulo al comic
      if (!webcomics[comicIndex].chapters) {
        webcomics[comicIndex].chapters = [];
      }
      webcomics[comicIndex].chapters.push(newChapter);

      // Guardar cambios con la clave del usuario
      await AsyncStorage.setItem(storageKey, JSON.stringify(webcomics));
      console.log('💾 Capítulo guardado en AsyncStorage');

      this.updateState({ isLoading: false, success: true });
    } catch (error) {
      console.error('❌ Error al publicar capítulo:', error);
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ocurrió un error al publicar el capítulo'
      });
    }
  }

  reset() {
    this.stateSubject.setValue(initialState);
  }

  resetError() {
    this.updateState({ error: null });
  }

  private updateState(partial: Partial<CreateChapterState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
