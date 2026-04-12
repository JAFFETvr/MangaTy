/**
 * Favorite Repository Interface
 */

import { Manga } from '@/src/features/manga/domain/entities';

export interface IFavoriteRepository {
  getFavorites(): Promise<Manga[]>;
  addFavorite(mangaId: number): Promise<void>;
  removeFavorite(mangaId: number): Promise<void>;
  isFavorite(mangaId: number): Promise<boolean>;
}
