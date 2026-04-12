/**
 * FavoritesViewModel - Manages state for FavoritesScreen
 */

import { Manga } from '@/src/features/manga/domain/entities';
import { StateFlow } from '@/src/shared/hooks';
import { AddFavorite, GetFavorites, RemoveFavorite } from '../../domain/use-cases';

export interface FavoritesViewModelState {
  favorites: Manga[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoritesViewModelState = {
  favorites: [],
  isLoading: false,
  error: null,
};

export class FavoritesViewModel {
  private stateSubject = new StateFlow<FavoritesViewModelState>(initialState);
  state$ = this.stateSubject;

  constructor(
    private getFavorites: GetFavorites,
    private addFavorite: AddFavorite,
    private removeFavorite: RemoveFavorite
  ) {}

  getState(): FavoritesViewModelState {
    return this.stateSubject.getValue();
  }

  async loadFavorites(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const favorites = await this.getFavorites.execute();
      this.updateState({
        favorites,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        error: 'Error al cargar favoritos',
        isLoading: false,
      });
    }
  }

  async toggleFavorite(manga: Manga): Promise<void> {
    try {
      const state = this.getState();
      const isFavorite = state.favorites.some((m) => m.id === manga.id);

      if (isFavorite) {
        await this.removeFavorite.execute(manga.id);
        this.updateState({
          favorites: state.favorites.filter((m) => m.id !== manga.id),
        });
      } else {
        await this.addFavorite.execute(manga.id);
        this.updateState({
          favorites: [...state.favorites, manga],
        });
      }
    } catch (error) {
      this.updateState({
        error: 'Error al actualizar favorito',
      });
    }
  }

  private updateState(partialState: Partial<FavoritesViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
