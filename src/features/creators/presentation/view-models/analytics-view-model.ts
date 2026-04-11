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
  totalViews: 2150,
  followers: 342,
  likes: 1856,
  income: 420,
  growth: {
    views: '+12.5%',
    followers: '+8.2%',
    likes: '+15.3%',
    income: '+22.1%',
  },
  popularChapters: [
    { id: '1', number: 1, views: 450, earnings: 120 },
    { id: '2', number: 2, views: 380, earnings: 95 },
    { id: '3', number: 3, views: 320, earnings: 80 },
    { id: '4', number: 4, views: 280, earnings: 70 },
    { id: '5', number: 5, views: 220, earnings: 55 },
  ],
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
        totalViews: manga.viewsCount || 2150,
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
