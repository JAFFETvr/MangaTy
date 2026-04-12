/**
 * SearchMangas UseCase
 */

import { Manga } from '../entities';
import { IMangaRepository } from '../repositories/manga-repository';

export class SearchMangas {
  constructor(private mangaRepository: IMangaRepository) {}

  async execute(query: string): Promise<Manga[]> {
    if (!query.trim()) {
      return this.mangaRepository.getAllMangas();
    }
    return this.mangaRepository.searchMangas(query);
  }
}
