import { TokenStorageService } from '@/src/core/http/token-storage-service';
import {
  getUserWebcomicsStorageKey,
  LocalWebcomicRecord,
  upsertPublicWebcomic,
} from '@/src/core/storage/local-webcomic-storage';
import { persistImageUri } from '@/src/core/utils/persist-image-uri';
import { Manga } from '@/src/features/manga/domain/entities';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';
import { StateFlow } from '@/src/shared/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EditWebcomicState {
  manga: Manga | null;
  mangaId: string | null;
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
  mangaId: null,
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
    this.updateState({ isLoading: true, mangaId });
    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      this.updateState({
        manga,
        form: {
          title: manga.title,
          description: manga.synopsis,
          selectedGenres: manga.genre
            ? manga.genre.split(',').map((g) => g.trim()).filter(Boolean)
            : [],
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

  setBannerImage(bannerImage: string) {
    this.updateForm({ bannerImage });
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
      const state = this.getState();
      const mangaId = state.mangaId;

      if (!mangaId) {
        throw new Error('No se puede guardar - ID no encontrado');
      }

      const userId = await TokenStorageService.getUserId();
      if (!userId) {
        throw new Error('No se pudo obtener el usuario');
      }

      const title = state.form.title.trim();
      const description = state.form.description.trim();
      const selectedGenres = state.form.selectedGenres.filter(Boolean);

      if (!title) {
        throw new Error('El título es obligatorio');
      }
      if (!description) {
        throw new Error('La descripción es obligatoria');
      }
      if (selectedGenres.length === 0) {
        throw new Error('Debes seleccionar al menos un género');
      }

      const storageKey = getUserWebcomicsStorageKey(userId);
      const storedStr = await AsyncStorage.getItem(storageKey);
      const webcomics = storedStr ? JSON.parse(storedStr) : [];
      const normalizedWebcomics = Array.isArray(webcomics) ? webcomics : [];
      const comicIndex = normalizedWebcomics.findIndex((w: any) => String(w?.id) === String(mangaId));

      let persistedBanner = state.form.bannerImage;
      try {
        persistedBanner = await persistImageUri(state.form.bannerImage);
      } catch (e) {
        console.error('Error persisting banner:', e);
      }

      const existing = comicIndex >= 0 ? normalizedWebcomics[comicIndex] : null;
      const updatedComic: LocalWebcomicRecord = {
        id: String(mangaId),
        title,
        description,
        genres: selectedGenres,
        coverImage: persistedBanner,
        creatorId: existing?.creatorId ?? userId,
        creatorName: existing?.creatorName ?? state.manga?.creatorName ?? 'Creador',
        viewsCount: existing?.viewsCount ?? state.manga?.viewsCount ?? 0,
        chapters: existing?.chapters ?? [],
        createdAt: existing?.createdAt ?? state.manga?.createdAt ?? new Date().toISOString(),
      };

      if (comicIndex >= 0) {
        normalizedWebcomics[comicIndex] = {
          ...normalizedWebcomics[comicIndex],
          ...updatedComic,
        };
      } else {
        normalizedWebcomics.push(updatedComic);
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(normalizedWebcomics));
      await upsertPublicWebcomic(userId, updatedComic);

      this.updateState({ isSaving: false, success: true });
    } catch (error) {
      this.updateState({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Error al guardar los cambios'
      });
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
