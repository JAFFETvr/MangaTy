/**
 * GetFavorites UseCase
 */

import { Manga } from '@/src/features/manga/domain/entities';
import { IFavoriteRepository } from '../repositories/favorite-repository';

export class GetFavorites {
  constructor(private repository: IFavoriteRepository) {}

  async execute(): Promise<Manga[]> {
    return this.repository.getFavorites();
  }
}
