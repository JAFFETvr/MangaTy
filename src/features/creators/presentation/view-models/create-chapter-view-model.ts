import { StateFlow } from '@/src/shared/hooks';

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
      // Mock de publicación
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.updateState({ isLoading: false, success: true });
    } catch (error) {
      this.updateState({ isLoading: false, error: 'Ocurrió un error al publicar el capítulo' });
    }
  }

  reset() {
    this.stateSubject.setValue(initialState);
  }

  private updateState(partial: Partial<CreateChapterState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
