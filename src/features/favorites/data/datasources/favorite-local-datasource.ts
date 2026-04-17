import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { loadPublicWebcomics } from '@/src/core/storage/local-webcomic-storage';
import { MangaRemoteDataSource } from '@/src/features/manga/data/datasources/manga-remote-datasource';
import { Manga } from '@/src/features/manga/domain/entities';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class FavoriteLocalDataSource {
  private mangaDataSource: MangaRemoteDataSource;

  constructor() {
    this.mangaDataSource = new MangaRemoteDataSource();
  }

  private async getStorageKey(): Promise<string> {
    const userId = await TokenStorageService.getUserId();
    return `@mangaty_${userId || 'guest'}_favorites`;
  }

  private async getFavoriteIds(): Promise<string[]> {
    const key = await this.getStorageKey();
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  }

  private async saveFavoriteIds(ids: string[]): Promise<void> {
    const key = await this.getStorageKey();
    await AsyncStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
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

  async getFavorites(): Promise<Manga[]> {
    const ids = await this.getFavoriteIds();
    if (ids.length === 0) return [];

    const catalogById = await this.getCatalogById();
    return ids
      .map((id) => catalogById.get(id))
      .filter((manga): manga is Manga => Boolean(manga));
  }

  async addFavorite(mangaId: string): Promise<void> {
    const current = await this.getFavoriteIds();
    current.push(String(mangaId));
    await this.saveFavoriteIds(current);
  }

  async removeFavorite(mangaId: string): Promise<void> {
    const current = await this.getFavoriteIds();
    await this.saveFavoriteIds(current.filter((id) => id !== String(mangaId)));
  }

  async isFavorite(mangaId: string): Promise<boolean> {
    const current = await this.getFavoriteIds();
    return current.includes(String(mangaId));
  }

  async countFavoritesForManga(mangaId: string): Promise<number> {
    const targetId = String(mangaId);
    const allKeys = await AsyncStorage.getAllKeys();
    const favoriteKeys = allKeys.filter(
      (key) => key.startsWith('@mangaty_') && key.endsWith('_favorites'),
    );

    if (favoriteKeys.length === 0) {
      return 0;
    }

    const entries = await AsyncStorage.multiGet(favoriteKeys);
    let count = 0;

    for (const [, value] of entries) {
      if (!value) continue;

      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) continue;

        const ids = parsed.map((id) => String(id));
        if (ids.includes(targetId)) {
          count += 1;
        }
      } catch {
        continue;
      }
    }

    return count;
  }
}
