import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { loadPublicWebcomics } from '@/src/core/storage/local-webcomic-storage';
import { MangaRemoteDataSource } from '@/src/features/manga/data/datasources/manga-remote-datasource';
import { Manga } from '@/src/features/manga/domain/entities';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingHistory } from '../../domain/entities';

type PersistedReadingHistory = Omit<ReadingHistory, 'timestamp'> & { timestamp: string };

export class HistoryLocalDataSource {
  private mangaDataSource: MangaRemoteDataSource;

  constructor() {
    this.mangaDataSource = new MangaRemoteDataSource();
  }

  private async getStorageKey(): Promise<string> {
    const userId = await TokenStorageService.getUserId();
    return `@mangaty_${userId || 'guest'}_history`;
  }

  private async getStoredHistory(): Promise<ReadingHistory[]> {
    const key = await this.getStorageKey();
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as PersistedReadingHistory[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((entry) => ({
      ...entry,
      mangaId: String(entry.mangaId),
      timestamp: new Date(entry.timestamp),
    }));
  }

  private async saveHistory(history: ReadingHistory[]): Promise<void> {
    const key = await this.getStorageKey();
    const serialized: PersistedReadingHistory[] = history.map((entry) => ({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    }));
    await AsyncStorage.setItem(key, JSON.stringify(serialized));
  }

  private async getCatalogById(): Promise<Map<string, Manga>> {
    let apiComics: Manga[] = [];
    try {
      apiComics = await this.mangaDataSource.getAllMangas();
    } catch {
      apiComics = [];
    }

    const localComics = (await loadPublicWebcomics()).map((comic: any): Manga => ({
      id: String(comic.id),
      title: comic.title || 'Webcomic',
      slug: `local-${comic.id}`,
      synopsis: comic.description || '',
      genre: Array.isArray(comic.genres) ? comic.genres.join(', ') : (comic.genres || ''),
      mature: false,
      viewsCount: comic.viewsCount ?? 0,
      coverImagePath: comic.coverImage || '',
      creatorName: comic.creatorName || 'Creador',
      createdAt: new Date().toISOString(),
      chaptersData: [],
    }));

    const byId = new Map<string, Manga>();
    [...localComics, ...apiComics].forEach((manga) => byId.set(String(manga.id), manga));
    return byId;
  }

  async getHistory(): Promise<(ReadingHistory & { manga: Manga })[]> {
    const history = await this.getStoredHistory();
    const catalogById = await this.getCatalogById();

    return history
      .map((entry) => {
        const manga = catalogById.get(String(entry.mangaId));
        if (manga) return { ...entry, manga };

        return {
          ...entry,
          manga: {
            id: String(entry.mangaId),
            title: 'Manga desconocido',
            slug: String(entry.mangaId),
            synopsis: '',
            genre: '',
            mature: false,
            viewsCount: 0,
            coverImagePath: '',
            creatorName: 'Autor',
            createdAt: new Date().toISOString(),
            chaptersData: [],
          },
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addToHistory(mangaId: string, chapterNumber: number, progress: number): Promise<void> {
    const current = await this.getStoredHistory();
    const mangaKey = String(mangaId);
    const existingIndex = current.findIndex((entry) => String(entry.mangaId) === mangaKey);

    if (existingIndex >= 0) {
      current[existingIndex] = {
        mangaId: mangaKey,
        chapterNumber,
        progress,
        timestamp: new Date(),
      };
    } else {
      current.push({
        mangaId: mangaKey,
        chapterNumber,
        progress,
        timestamp: new Date(),
      });
    }

    await this.saveHistory(current);
  }

  async clearHistory(): Promise<void> {
    const key = await this.getStorageKey();
    await AsyncStorage.removeItem(key);
  }
}
