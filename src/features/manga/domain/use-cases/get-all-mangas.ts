/**
 * GetAllMangas UseCase
 */

import { Manga } from '../entities';
import { IMangaRepository } from '../repositories/manga-repository';

export class GetAllMangas {
  constructor(private mangaRepository: IMangaRepository) {}

  async execute(): Promise<Manga[]> {
    return this.mangaRepository.getAllMangas();
  }
}
