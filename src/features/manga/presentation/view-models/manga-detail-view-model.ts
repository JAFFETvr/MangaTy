/**
 * MangaDetailViewModel - Gestiona el estado de la pantalla WebcomicDetail
 * Llama al use case GetMangaDetail que ejecuta 2 fetches en paralelo.
 */

import { StateFlow } from '@/src/shared/hooks';
import { Manga } from '../../domain/entities';
import { GetMangaDetail } from '../../domain/use-cases';

export interface MangaDetailViewModelState {
  manga: Manga | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MangaDetailViewModelState = {
  manga: null,
  isLoading: false,
  error: null,
};

export class MangaDetailViewModel {
  private stateSubject = new StateFlow<MangaDetailViewModelState>(initialState);
  state$ = this.stateSubject;

  constructor(private getMangaDetail: GetMangaDetail) {}

  getState(): MangaDetailViewModelState {
    return this.stateSubject.getValue();
  }

  /**
   * Lanza las 2 peticiones en paralelo a la API.
   * @param slug     campo slug del listado (GET /api/comics/{slug})
   * @param mangaId  UUID del listado (GET /api/comics/{id}/chapters)
   */
  async loadDetail(slug: string, mangaId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null, manga: null });

    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      this.updateState({ manga, isLoading: false });
    } catch (err: any) {
      this.updateState({
        error: err?.message ?? 'Error al cargar el webcomic',
        isLoading: false,
      });
    }
  }

  private updateState(partial: Partial<MangaDetailViewModelState>): void {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
