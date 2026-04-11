import { StateFlow } from '@/src/shared/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Obtener webcomics del cache local
      const storedStr = await AsyncStorage.getItem('@mock_created_webcomics');
      if (!storedStr) {
        throw new Error('Comic no encontrado');
      }

      const webcomics = JSON.parse(storedStr);
      const comicIndex = webcomics.findIndex((w: any) => w.id === mangaId);

      if (comicIndex === -1) {
        throw new Error('Comic no encontrado');
      }

      // Crear nuevo capítulo
      const newChapter = {
        id: `chapter-${Date.now()}`,
        chapterNumber: (webcomics[comicIndex].chapters?.length || 0) + 1,
        title: title,
        premium: false,
        priceTyCoins: 0,
        publishedAt: new Date().toISOString(),
        pages: images,
      };

      // Agregar capítulo al comic
      if (!webcomics[comicIndex].chapters) {
        webcomics[comicIndex].chapters = [];
      }
      webcomics[comicIndex].chapters.push(newChapter);

      // Guardar cambios
      await AsyncStorage.setItem('@mock_created_webcomics', JSON.stringify(webcomics));

      this.updateState({ isLoading: false, success: true });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ocurrió un error al publicar el capítulo'
      });
    }
  }

  reset() {
    this.stateSubject.setValue(initialState);
  }

  private updateState(partial: Partial<CreateChapterState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
