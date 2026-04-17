import { countUniqueReadersForManga } from '@/src/core/storage/local-webcomic-storage';
import { FavoriteLocalDataSource } from '@/src/features/favorites/data/datasources/favorite-local-datasource';
import { Manga } from '@/src/features/manga/domain/entities';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';
import { StateFlow } from '@/src/shared/hooks';

export interface AnalyticsState {
  manga: Manga | null;
  isLoading: boolean;
  totalViews: number;
  followers: number;
  likes: number;
  income: number;
  growth: {
    views: string;
    followers: string;
    likes: string;
    income: string;
  };
  popularChapters: Array<{
    id: string;
    number: number;
    views: number;
    earnings: number;
  }>;
}

const initialState: AnalyticsState = {
  manga: null,
  isLoading: false,
  totalViews: 0,
  followers: 0,
  likes: 0,
  income: 0,
  growth: {
    views: '+0%',
    followers: '+0%',
    likes: '+0%',
    income: '+0%',
  },
  popularChapters: [],
};

export class AnalyticsViewModel {
  private stateSubject = new StateFlow<AnalyticsState>(initialState);
  state$ = this.stateSubject;
  private favoriteLocalDataSource = new FavoriteLocalDataSource();

  constructor(private getMangaDetail: GetMangaDetail) {}

  getState() {
    return this.stateSubject.getValue();
  }

  async loadAnalytics(slug: string, mangaId: string) {
    this.updateState({ isLoading: true });
    
    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      const uniqueReaders = await countUniqueReadersForManga(manga.id);
      const localFavoriteCount = await this.favoriteLocalDataSource.countFavoritesForManga(manga.id);
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
        totalViews: uniqueReaders,
        likes,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({ isLoading: false });
    }
  }

  private updateState(partial: Partial<AnalyticsState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
