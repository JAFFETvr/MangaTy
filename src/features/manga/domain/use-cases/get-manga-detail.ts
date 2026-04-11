/**
 * GetMangaDetail UseCase
 * Obtiene el detalle completo de un comic + sus capítulos en paralelo
 */

import { Manga } from '../entities';
import { IMangaRepository } from '../repositories/manga-repository';

export class GetMangaDetail {
  constructor(private mangaRepository: IMangaRepository) {}

  async execute(slug: string, mangaId: string): Promise<Manga> {
    return this.mangaRepository.getMangaDetail(slug, mangaId);
  }
}
