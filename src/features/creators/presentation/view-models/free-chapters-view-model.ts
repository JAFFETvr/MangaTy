import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { Manga } from '@/src/features/manga/domain/entities';
import { GetMangaDetail } from '@/src/features/manga/domain/use-cases';
import { StateFlow } from '@/src/shared/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FreeChaptersState {
  manga: Manga | null;
  isLoading: boolean;
  isSaving: boolean;
  paidChapterIds: string[];
  error: string | null;
  success: boolean;
}

const initialState: FreeChaptersState = {
  manga: null,
  isLoading: false,
  isSaving: false,
  paidChapterIds: [],
  error: null,
  success: false,
};

export class FreeChaptersViewModel {
  private stateSubject = new StateFlow<FreeChaptersState>(initialState);
  state$ = this.stateSubject;

  constructor(private getMangaDetail: GetMangaDetail) {}

  private getPaidStorageKey(mangaId: string): string {
    return `@mangaty_paid_chapters_${mangaId}`;
  }

  private getLegacyFreeStorageKey(mangaId: string): string {
    return `@mangaty_free_chapters_${mangaId}`;
  }

  getState() {
    return this.stateSubject.getValue();
  }

  private mapCreatorChapter(raw: any) {
    return {
      id: raw.id ?? raw.chapterId,
      chapterNumber: Number(raw.chapterNumber ?? raw.number ?? 0),
      title: raw.title ?? `Capítulo ${raw.chapterNumber ?? raw.number ?? ''}`.trim(),
      premium: Boolean(raw.premium ?? raw.isPremium ?? false),
      priceTyCoins: Number(raw.priceTyCoins ?? raw.price ?? 0),
      publishedAt: raw.publishedAt ?? '',
    };
  }

  private async loadChaptersFromCreatorCatalog(mangaId: string): Promise<Manga | null> {
    try {
      const token = await TokenStorageService.getToken();
      if (token) {
        httpClient.setToken(token);
      }
      const response = await httpClient.get<any>('/comics/me?page=0&size=100&sort=createdAt,desc');
      const list = Array.isArray(response)
        ? response
        : (response?.content ?? response?.data ?? response?.comics ?? []);
      const target = Array.isArray(list)
        ? list.find((comic: any) => String(comic?.id) === String(mangaId))
        : null;

      if (!target) return null;

      const chaptersResponse = await httpClient.get<any>(`/comics/${mangaId}/chapters`);
      const chapterList = Array.isArray(chaptersResponse)
        ? chaptersResponse
        : (chaptersResponse?.content ?? chaptersResponse?.data ?? chaptersResponse?.chapters ?? []);

      const chapters = (Array.isArray(chapterList) ? chapterList : [])
        .map((chapter: any) => this.mapCreatorChapter(chapter))
        .filter((chapter) => Boolean(chapter.id))
        .sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0));

      return {
        id: target.id,
        title: target.title ?? 'Mi webcomic',
        slug: target.slug ?? '',
        synopsis: target.synopsis ?? '',
        genre: target.genre ?? '',
        mature: target.mature ?? false,
        viewsCount: target.viewsCount ?? 0,
        coverImagePath: target.coverImagePath ?? '',
        creatorName: target.creatorName ?? '',
        createdAt: target.createdAt ?? '',
        chaptersData: chapters,
      };
    } catch {
      return null;
    }
  }

  async loadChapters(slug: string, mangaId: string) {
    this.updateState({ isLoading: true, error: null });
    try {
      const fromCreatorCatalog = await this.loadChaptersFromCreatorCatalog(mangaId);
      const manga = fromCreatorCatalog
        ? fromCreatorCatalog
        : await this.getMangaDetail.execute(slug, mangaId);

      const storedPaid = await AsyncStorage.getItem(this.getPaidStorageKey(mangaId));
      const legacyFree = await AsyncStorage.getItem(this.getLegacyFreeStorageKey(mangaId));
      const validChapterIds = new Set((manga.chaptersData || []).map((chapter) => String(chapter.id)));
      const allChapterIds = (manga.chaptersData || []).map((chapter) => String(chapter.id));

      let initialPaid: string[] = [];
      if (storedPaid) {
        const persistedPaidIds = JSON.parse(storedPaid);
        initialPaid = Array.isArray(persistedPaidIds)
          ? persistedPaidIds.filter((id: unknown) => typeof id === 'string' && validChapterIds.has(id))
          : [];
      } else if (legacyFree) {
        const persistedFreeIds = JSON.parse(legacyFree);
        const validFree = Array.isArray(persistedFreeIds)
          ? persistedFreeIds.filter((id: unknown) => typeof id === 'string' && validChapterIds.has(id))
          : [];
        initialPaid = allChapterIds.filter((id) => !validFree.includes(id));
      } else {
        initialPaid = (manga.chaptersData || [])
          .filter((chapter) => chapter.premium || chapter.priceTyCoins > 0)
          .map((chapter) => chapter.id);
      }

      this.updateState({
        manga,
        paidChapterIds: initialPaid,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: 'No se pudieron cargar los capítulos',
      });
    }
  }

  toggleChapter(chapterId: string) {
    const current = [...this.getState().paidChapterIds];
    const index = current.indexOf(chapterId);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(chapterId);
    }
    
    this.updateState({ paidChapterIds: current });
  }

  async saveConfig(mangaId: string) {
    this.updateState({ isSaving: true, error: null });
    try {
      await AsyncStorage.setItem(
        this.getPaidStorageKey(mangaId),
        JSON.stringify(this.getState().paidChapterIds),
      );
      // Compatibilidad con la versión anterior (que guardaba capítulos gratis)
      const allChapterIds = (this.getState().manga?.chaptersData || []).map((chapter) => String(chapter.id));
      const freeIds = allChapterIds.filter((id) => !this.getState().paidChapterIds.includes(id));
      await AsyncStorage.setItem(this.getLegacyFreeStorageKey(mangaId), JSON.stringify(freeIds));
      this.updateState({ isSaving: false, success: true });
    } catch (error) {
      this.updateState({
        isSaving: false,
        error: 'Error al guardar la configuración de capítulos',
      });
    }
  }

  resetStatus() {
    this.updateState({ success: false, error: null });
  }

  private updateState(partial: Partial<FreeChaptersState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
