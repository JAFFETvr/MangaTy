/**
 * RemoveFavorite UseCase
 */

import { IFavoriteRepository } from '../repositories/favorite-repository';

export class RemoveFavorite {
  constructor(private repository: IFavoriteRepository) {}

  async execute(mangaId: string): Promise<void> {
    return this.repository.removeFavorite(mangaId);
  }
}
