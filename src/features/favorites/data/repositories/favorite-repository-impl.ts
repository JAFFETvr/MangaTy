/**
 * Favorite Repository Implementation
 */

import { Manga } from '@/src/features/manga/domain/entities';
import { IFavoriteRepository } from '../../domain/repositories/favorite-repository';
import { FavoriteLocalDataSource } from '../datasources/favorite-local-datasource';

export class FavoriteRepositoryImpl implements IFavoriteRepository {
  constructor(private dataSource: FavoriteLocalDataSource) {}

  async getFavorites(): Promise<Manga[]> {
    return this.dataSource.getFavorites();
  }

  async addFavorite(mangaId: string): Promise<void> {
    return this.dataSource.addFavorite(mangaId);
  }

  async removeFavorite(mangaId: string): Promise<void> {
    return this.dataSource.removeFavorite(mangaId);
  }

  async isFavorite(mangaId: string): Promise<boolean> {
    return this.dataSource.isFavorite(mangaId);
  }
}
