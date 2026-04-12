/**
 * AddFavorite UseCase
 */

import { IFavoriteRepository } from '../repositories/favorite-repository';

export class AddFavorite {
  constructor(private repository: IFavoriteRepository) {}

  async execute(mangaId: number): Promise<void> {
    return this.repository.addFavorite(mangaId);
  }
}
