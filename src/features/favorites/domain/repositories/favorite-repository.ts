/**
 * Favorite Repository Interface
 */

import { Manga } from '@/src/features/manga/domain/entities';

export interface IFavoriteRepository {
  getFavorites(): Promise<Manga[]>;
  addFavorite(mangaId: string): Promise<void>;
  removeFavorite(mangaId: string): Promise<void>;
  isFavorite(mangaId: string): Promise<boolean>;
}
