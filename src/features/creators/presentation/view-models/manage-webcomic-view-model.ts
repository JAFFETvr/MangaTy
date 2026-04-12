import { StateFlow } from '@/src/shared/hooks';
import { Manga, Chapter } from '@/src/features/manga/domain/entities';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';

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

  constructor(private getMangaDetail: GetMangaDetail) {}

  getState(): ManageWebcomicState {
    return this.stateSubject.getValue();
  }

  async loadMangaDetails(slug: string, mangaId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const manga = await this.getMangaDetail.execute(slug, mangaId);
      
      this.updateState({
        manga,
        chapters: manga.chaptersData || [],
        stats: {
          views: manga.viewsCount || 0,
          followers: Math.floor(manga.viewsCount * 0.15), // Mock: 15% of views are followers
          likes: Math.floor(manga.viewsCount * 0.25),     // Mock: 25% of views are likes
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
