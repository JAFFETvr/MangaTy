/**
 * MangaDetailViewModel - Manages state for MangaDetailScreen
 */

import { StateFlow } from '@/src/shared/hooks';
import { Manga } from '../../domain/entities';
import { GetMangaById } from '../../domain/use-cases';

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

  constructor(private getMangaById: GetMangaById) {}

  getState(): MangaDetailViewModelState {
    return this.stateSubject.getValue();
  }

  async loadMangaDetail(mangaId: number): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const manga = await this.getMangaById.execute(mangaId);
      if (manga) {
        this.updateState({
          manga,
          isLoading: false,
        });
      } else {
        this.updateState({
          error: 'Manga no encontrado',
          isLoading: false,
        });
      }
    } catch (error) {
      this.updateState({
        error: 'Error al cargar el detalle',
        isLoading: false,
      });
    }
  }

  private updateState(partialState: Partial<MangaDetailViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
