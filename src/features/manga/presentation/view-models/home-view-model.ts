/**
 * HomeViewModel - Manages state for HomeScreen
 * MVVM pattern: ViewModel exposes observables that UI subscribes to
 */

import { StateFlow } from '@/src/shared/hooks';
import { Manga } from '../../domain/entities';
import { GetAllMangas } from '../../domain/use-cases';

export interface HomeViewModelState {
  mangas: Manga[];
  filteredMangas: Manga[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: HomeViewModelState = {
  mangas: [],
  filteredMangas: [],
  isLoading: false,
  error: null,
  searchQuery: '',
};

export class HomeViewModel {
  private stateSubject = new StateFlow<HomeViewModelState>(initialState);
  state$ = this.stateSubject;

  constructor(private getAllMangas: GetAllMangas) {}

  getState(): HomeViewModelState {
    return this.stateSubject.getValue();
  }

  async loadMangas(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const mangas = await this.getAllMangas.execute();
      this.updateState({
        mangas,
        filteredMangas: mangas,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        error: 'Error al cargar mangas',
        isLoading: false,
      });
    }
  }

  /** Búsqueda local sobre los mangas ya cargados */
  searchLocal(query: string): void {
    const state = this.getState();
    if (!query.trim()) {
      this.updateState({ filteredMangas: state.mangas, searchQuery: '' });
      return;
    }
    const lower = query.toLowerCase();
    const results = state.mangas.filter(
      (m) => m.title.toLowerCase().includes(lower) || m.genre.toLowerCase().includes(lower)
    );
    this.updateState({ filteredMangas: results, searchQuery: query });
  }

  private updateState(partialState: Partial<HomeViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
