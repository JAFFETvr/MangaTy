/**
 * Favorites Remote DataSource
 * Handles favorite manga operations
 */

import { httpClient } from '@/src/core/http/http-client';

interface FavoriteMangaResponse {
  id: string;
  mangaId: string;
  title: string;
  slug: string;
  coverImagePath: string;
  status: string;
  genre: string;
  createdAt: string;
}

interface ToggleFavoriteResponse {
  mangaId: string;
  favorited: boolean;
  message: string;
}

export class FavoritesRemoteDataSource {
  /**
   * Get all favorite mangas
   */
  async getFavorites(): Promise<FavoriteMangaResponse[]> {
    try {
      const response = await httpClient.get<FavoriteMangaResponse[]>('/library/favorites');
      return response;
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for a manga
   */
  async toggleFavorite(mangaId: string): Promise<ToggleFavoriteResponse> {
    try {
      const response = await httpClient.post<ToggleFavoriteResponse>(
        `/library/favorites/${mangaId}`,
        {}
      );
      return response;
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Add manga to favorites
   */
  async addFavorite(mangaId: string): Promise<boolean> {
    try {
      const response = await this.toggleFavorite(mangaId);
      return response.favorited;
    } catch (error) {
      console.error('❌ Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Remove manga from favorites
   */
  async removeFavorite(mangaId: string): Promise<boolean> {
    try {
      const response = await this.toggleFavorite(mangaId);
      // If response says not favorited, it was removed
      return !response.favorited;
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      throw error;
    }
  }
}
