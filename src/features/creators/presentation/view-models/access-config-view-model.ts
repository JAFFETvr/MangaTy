import { httpClient } from '@/src/core/http/http-client';
import { loadPublicWebcomics } from '@/src/core/storage/local-webcomic-storage';
import { loadMangaAccessConfig, saveMangaAccessConfig } from '@/src/core/storage/manga-access-storage';
import { StateFlow } from '@/src/shared/hooks';

export type AccessLevel = 'public' | 'unlisted' | 'private';
export type AgeRating = 'all' | '18plus';

export interface AccessConfigState {
  isLoading: boolean;
  isSaving: boolean;
  mangaTitle: string;
  accessLevel: AccessLevel;
  ageRating: AgeRating;
  allowSharing: boolean;
  success: boolean;
  error: string | null;
}

const initialState: AccessConfigState = {
  isLoading: false,
  isSaving: false,
  mangaTitle: '',
  accessLevel: 'public',
  ageRating: 'all',
  allowSharing: true,
  success: false,
  error: null,
};

export class AccessConfigViewModel {
  private stateSubject = new StateFlow<AccessConfigState>(initialState);
  state$ = this.stateSubject;

  getState() {
    return this.stateSubject.getValue();
  }

  private async resolveMangaTitle(mangaId: string): Promise<string> {
    try {
      const localComics = await loadPublicWebcomics();
      const local = localComics.find((comic: any) => String(comic?.id) === String(mangaId));
      if (local?.title) {
        return String(local.title);
      }
    } catch {
      // continuar con fallback remoto
    }

    try {
      const response = await httpClient.get<any>('/comics/me?page=0&size=100&sort=createdAt,desc');
      const list = Array.isArray(response)
        ? response
        : (response?.content ?? response?.data ?? response?.comics ?? []);
      const match = Array.isArray(list)
        ? list.find((comic: any) => String(comic?.id) === String(mangaId))
        : null;
      return typeof match?.title === 'string' ? match.title : '';
    } catch {
      return '';
    }
  }

  async loadConfig(mangaId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const mangaTitle = await this.resolveMangaTitle(mangaId);
      const parsed = await loadMangaAccessConfig(mangaId);
      this.updateState({
        isLoading: false,
        mangaTitle: mangaTitle || parsed?.mangaTitle || 'Mi webcomic',
        accessLevel: parsed?.accessLevel ?? 'public',
        ageRating: parsed?.ageRating ?? 'all',
        allowSharing: typeof parsed?.allowSharing === 'boolean' ? parsed.allowSharing : true,
      });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudo cargar la configuración',
      });
    }
  }

  setAccessLevel(level: AccessLevel) {
    this.updateState({ accessLevel: level });
  }

  setAgeRating(rating: AgeRating) {
    this.updateState({ ageRating: rating });
  }

  setAllowSharing(allow: boolean) {
    this.updateState({ allowSharing: allow });
  }

  async saveConfig(mangaId: string) {
    this.updateState({ isSaving: true, error: null });
    try {
      const state = this.getState();
      await saveMangaAccessConfig(mangaId, {
        mangaTitle: state.mangaTitle,
        accessLevel: state.accessLevel,
        ageRating: state.ageRating,
        allowSharing: state.allowSharing,
      });

      this.updateState({ isSaving: false, success: true });
    } catch (error) {
      this.updateState({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Error al guardar la configuración',
      });
    }
  }

  resetStatus() {
    this.updateState({ success: false, error: null });
  }

  private updateState(partial: Partial<AccessConfigState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
