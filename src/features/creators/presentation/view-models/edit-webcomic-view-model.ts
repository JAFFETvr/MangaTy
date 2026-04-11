import { StateFlow } from '@/src/shared/hooks';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';
import { Manga } from '@/src/features/manga/domain/entities';

export interface EditWebcomicState {
  manga: Manga | null;
  isLoading: boolean;
  isSaving: boolean;
  form: {
    title: string;
    description: string;
    selectedGenres: string[];
    bannerImage: string | null;
    promoImage: string | null;
  };
  error: string | null;
  success: boolean;
}

const initialState: EditWebcomicState = {
  manga: null,
  isLoading: false,
  isSaving: false,
  form: {
    title: '',
    description: '',
    selectedGenres: [],
    bannerImage: null,
    promoImage: null,
  },
  error: null,
  success: false,
};

export const AVAILABLE_GENRES = [
  'Acción', 'Romance', 'Comedia', 'Drama', 'Fantasía', 
  'Ciencia Ficción', 'Terror', 'Misterio', 'Aventura', 
  'Slice of Life', 'Deportes', 'Histórico', 'Supernatural', 
  'Psicológico', 'Thriller'
];

export class EditWebcomicViewModel {
  private stateSubject = new StateFlow<EditWebcomicState>(initialState);
  state$ = this.stateSubject;

  constructor(private getMangaDetail: GetMangaDetail) {}

  getState() {
    return this.stateSubject.getValue();
  }

  async loadWebcomic(slug: string, mangaId: string) {
    this.updateState({ isLoading: true });
    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      this.updateState({
        manga,
        form: {
          title: manga.title,
          description: manga.synopsis,
          selectedGenres: manga.genre.split(',').map(g => g.trim()),
          bannerImage: manga.coverImagePath,
          promoImage: null, // Mock
        },
        isLoading: false,
      });
    } catch (error) {
      this.updateState({ isLoading: false, error: 'No se pudo cargar la información' });
    }
  }

  setTitle(title: string) {
    this.updateForm({ title });
  }

  setDescription(description: string) {
    this.updateForm({ description });
  }

  toggleGenre(genre: string) {
    const current = [...this.getState().form.selectedGenres];
    const index = current.indexOf(genre);
    
    if (index > -1) {
      current.splice(index, 1);
    } else if (current.length < 3) {
      current.push(genre);
    } else {
      // Máximo 3
      return;
    }
    
    this.updateForm({ selectedGenres: current });
  }

  async saveChanges() {
    this.updateState({ isSaving: true, error: null });
    try {
      // Mock de guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.updateState({ isSaving: false, success: true });
    } catch (error) {
      this.updateState({ isSaving: false, error: 'Error al guardar los cambios' });
    }
  }

  resetStatus() {
    this.updateState({ success: false, error: null });
  }

  private updateForm(partial: Partial<EditWebcomicState['form']>) {
    this.updateState({ form: { ...this.getState().form, ...partial } });
  }

  private updateState(partial: Partial<EditWebcomicState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
