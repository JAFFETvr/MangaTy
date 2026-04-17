import { Chapter, Manga } from '@/src/features/manga/domain/entities';
import { FavoriteLocalDataSource } from '@/src/features/favorites/data/datasources/favorite-local-datasource';
import { countUniqueReadersForManga } from '@/src/core/storage/local-webcomic-storage';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';
import { StateFlow } from '@/src/shared/hooks';

export interface ManageWebcomicState {
  manga: Manga | null;
  chapters: Chapter[];
  isLoading: boolean;
  error: string | null;
  stats: {
    views: number;
    followers: number;
    likes: number;
  };
}

const initialState: ManageWebcomicState = {
  manga: null,
  chapters: [],
  isLoading: false,
  error: null,
  stats: {
    views: 0,
    followers: 0,
    likes: 0,
  },
};

export class ManageWebcomicViewModel {
  private stateSubject = new StateFlow<ManageWebcomicState>(initialState);
  state$ = this.stateSubject;
  private favoriteLocalDataSource = new FavoriteLocalDataSource();

  constructor(private getMangaDetail: GetMangaDetail) {}

  getState(): ManageWebcomicState {
    return this.stateSubject.getValue();
  }

  async loadMangaDetails(slug: string, mangaId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      const localFavoriteCount = await this.favoriteLocalDataSource.countFavoritesForManga(manga.id);
      const uniqueReaders = await countUniqueReadersForManga(manga.id);
      const likesFromApi = Number(
        (manga as any)?.likesCount ??
          (manga as any)?.favoriteCount ??
          (manga as any)?.favoritesCount ??
          0,
      );
      const likes = Number.isFinite(likesFromApi)
        ? Math.max(0, Math.max(localFavoriteCount, likesFromApi))
        : Math.max(0, localFavoriteCount);
      
      this.updateState({
        manga,
        chapters: manga.chaptersData || [],
        stats: {
          views: uniqueReaders,
          followers: 0,
          likes,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading manga management details:', error);
      this.updateState({
        error: 'Error al cargar los detalles del webcomic',
        isLoading: false,
      });
    }
  }

  private updateState(partialState: Partial<ManageWebcomicState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
