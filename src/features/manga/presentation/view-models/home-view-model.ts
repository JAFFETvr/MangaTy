/**
 * HomeViewModel - Manages state for HomeScreen
 * MVVM pattern: ViewModel exposes observables that UI subscribes to
 */

import { StateFlow } from '@/src/shared/hooks';
import { Manga } from '../../domain/entities';
import { GetAllMangas, SearchMangas } from '../../domain/use-cases';

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

  constructor(
    private getAllMangas: GetAllMangas,
    private searchMangas: SearchMangas
  ) {}

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

  async search(query: string): Promise<void> {
    this.updateState({ searchQuery: query, isLoading: true });

    try {
      if (!query.trim()) {
        const state = this.getState();
        this.updateState({
          filteredMangas: state.mangas,
          isLoading: false,
        });
        return;
      }

      const results = await this.searchMangas.execute(query);
      this.updateState({
        filteredMangas: results,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        error: 'Error en la búsqueda',
        isLoading: false,
      });
    }
  }

  private updateState(partialState: Partial<HomeViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
