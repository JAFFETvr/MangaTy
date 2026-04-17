import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { httpClient } from '@/src/core/http/http-client';
import { StateFlow } from '@/src/shared/hooks';
import { Platform } from 'react-native';

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
      const token = await TokenStorageService.getToken();
      if (!token) {
        throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
      }
      httpClient.setToken(token);

      const existingChapters = await httpClient.get<any[]>(`/comics/${mangaId}/chapters`);
      const maxChapterNumber = (existingChapters || []).reduce(
        (max, chapter) => Math.max(max, Number(chapter.chapterNumber) || 0),
        0,
      );
      const nextChapterNumber = maxChapterNumber + 1;

      const createdChapter = await httpClient.post<any>(`/comics/${mangaId}/chapters`, {
        chapterNumber: nextChapterNumber,
        title: title.trim(),
        premium: false,
        priceTyCoins: 0,
      });

      for (let index = 0; index < images.length; index++) {
        const imageUri = images[index];
        const formData = new FormData();

        if (Platform.OS === 'web') {
          const imageResponse = await fetch(imageUri);
          const blob = await imageResponse.blob();
          formData.append('file', blob, `page_${index + 1}.jpg`);
        } else {
          formData.append('file', {
            uri: imageUri,
            name: `page_${index + 1}.jpg`,
            type: 'image/jpeg',
          } as any);
        }

        formData.append('pageNumber', String(index + 1));
        await httpClient.postFormData(`/comics/${mangaId}/chapters/${createdChapter.id}/pages`, formData);
      }

      await httpClient.patch(`/comics/${mangaId}/chapters/${createdChapter.id}/publish`);

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
