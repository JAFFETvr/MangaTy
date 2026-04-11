import { StateFlow } from '@/src/shared/hooks';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';
import { Manga } from '@/src/features/manga/domain/entities';

export interface FreeChaptersState {
  manga: Manga | null;
  isLoading: boolean;
  isSaving: boolean;
  freeChapterIds: string[];
  error: string | null;
  success: boolean;
}

const initialState: FreeChaptersState = {
  manga: null,
  isLoading: false,
  isSaving: false,
  freeChapterIds: [],
  error: null,
  success: false,
};

export class FreeChaptersViewModel {
  private stateSubject = new StateFlow<FreeChaptersState>(initialState);
  state$ = this.stateSubject;

  constructor(private getMangaDetail: GetMangaDetail) {}

  getState() {
    return this.stateSubject.getValue();
  }

  async loadChapters(slug: string, mangaId: string) {
    this.updateState({ isLoading: true, error: null });
    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      // Por defecto, filtramos los que NO son premium en la entidad (si la API lo devuelve)
      const initialFree = manga.chaptersData
        .filter(ch => !ch.premium)
        .map(ch => ch.id);

      this.updateState({
        manga,
        freeChapterIds: initialFree,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({ isLoading: false, error: 'No se pudieron cargar los capítulos' });
    }
  }

  toggleChapter(chapterId: string) {
    const current = [...this.getState().freeChapterIds];
    const index = current.indexOf(chapterId);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(chapterId);
    }
    
    this.updateState({ freeChapterIds: current });
  }

  async saveConfig() {
    this.updateState({ isSaving: true, error: null });
    try {
      // Mock de guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.updateState({ isSaving: false, success: true });
    } catch (error) {
      this.updateState({ isSaving: false, error: 'Error al guardar la configuración' });
    }
  }

  resetStatus() {
    this.updateState({ success: false, error: null });
  }

  private updateState(partial: Partial<FreeChaptersState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
