/**
 * Favorite Local DataSource
 */

import { MangaLocalDataSource } from '@/src/features/manga/data/datasources/manga-local-datasource';
import { Manga } from '@/src/features/manga/domain/entities';

export class FavoriteLocalDataSource {
  private favoriteIds: Set<number> = new Set();
  private mangaDataSource: MangaLocalDataSource;

  constructor() {
    this.mangaDataSource = new MangaLocalDataSource();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // In production, use AsyncStorage
    // For now, we'll keep it in memory
  }

  async getFavorites(): Promise<Manga[]> {
    const allMangas = await this.mangaDataSource.getAllMangas();
    return allMangas.filter((m) => this.favoriteIds.has(m.id));
  }

  async addFavorite(mangaId: number): Promise<void> {
    this.favoriteIds.add(mangaId);
    // Save to AsyncStorage in production
  }

  async removeFavorite(mangaId: number): Promise<void> {
    this.favoriteIds.delete(mangaId);
    // Save to AsyncStorage in production
  }

  async isFavorite(mangaId: number): Promise<boolean> {
    return this.favoriteIds.has(mangaId);
  }
}
