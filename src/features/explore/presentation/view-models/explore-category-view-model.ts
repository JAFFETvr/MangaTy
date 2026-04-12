import { Manga } from '@/src/features/manga/domain/entities';
import { GetAllMangas } from '@/src/features/manga/domain/use-cases';
import { StateFlow } from '@/src/shared/hooks';

export type SortType = 'popular' | 'recent' | 'views' | 'az';

export interface ExploreCategoryState {
  mangas: Manga[];
  isLoading: boolean;
  error: string | null;
  currentSort: SortType;
}

const initialState: ExploreCategoryState = {
  mangas: [],
  isLoading: false,
  error: null,
  currentSort: 'popular',
};

export class ExploreCategoryViewModel {
  private stateSubject = new StateFlow<ExploreCategoryState>(initialState);
  state$ = this.stateSubject;

  constructor(private getAllMangas: GetAllMangas) {}

  getState(): ExploreCategoryState {
    return this.stateSubject.getValue();
  }

  async loadMangas(genre: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const allMangas = await this.getAllMangas.execute();
      
      // Filtrar por género (case-insensitive, busca en múltiples géneros separados por coma)
      const genreLower = genre.toLowerCase();
      const filtered = allMangas.filter(m => {
        const genres = m.genre.split(',').map(g => g.trim().toLowerCase());
        return genres.some(g => g === genreLower || g.includes(genreLower));
      });

      this.updateState({
        mangas: this.sortMangas(filtered, this.getState().currentSort),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading mangas by genre:', error);
      this.updateState({
        error: 'Error al cargar los webcomics de esta categoría',
        isLoading: false,
      });
    }
  }

  setSort(sortType: SortType): void {
    const currentState = this.getState();
    if (currentState.currentSort === sortType) return;

    this.updateState({
      currentSort: sortType,
      mangas: this.sortMangas(currentState.mangas, sortType),
    });
  }

  private sortMangas(mangas: Manga[], sortType: SortType): Manga[] {
    const sorted = [...mangas];
    switch (sortType) {
      case 'popular':
      case 'views':
        return sorted.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'az':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }

  private updateState(partialState: Partial<ExploreCategoryState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
