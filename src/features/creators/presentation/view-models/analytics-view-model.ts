import { StateFlow } from '@/src/shared/hooks';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';
import { Manga } from '@/src/features/manga/domain/entities';

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

  constructor(private getMangaDetail: GetMangaDetail) {}

  getState() {
    return this.stateSubject.getValue();
  }

  async loadAnalytics(slug: string, mangaId: string) {
    this.updateState({ isLoading: true });
    
    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      
      // En una app real, aquí llamaríamos a un endpoint de analíticas
      // Para este prototipo, mezclamos datos reales del manga con mocks de rendimiento
      this.updateState({
        manga,
        totalViews: manga.viewsCount || 0,
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
