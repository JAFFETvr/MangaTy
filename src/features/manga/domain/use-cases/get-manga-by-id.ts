/**
 * GetMangaById UseCase
 */

import { Manga } from '../entities';
import { IMangaRepository } from '../repositories/manga-repository';

export class GetMangaById {
  constructor(private mangaRepository: IMangaRepository) {}

  async execute(id: number): Promise<Manga | null> {
    return this.mangaRepository.getMangaById(id);
  }
}
