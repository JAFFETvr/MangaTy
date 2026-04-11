/**
 * Manga Repository Implementation
 * Delega al datasource remoto (API real).
 */

import { Manga } from '../../domain/entities';
import { IMangaRepository } from '../../domain/repositories/manga-repository';
import { MangaRemoteDataSource } from '../datasources/manga-remote-datasource';

export class MangaRepositoryImpl implements IMangaRepository {
  constructor(private remote: MangaRemoteDataSource) {}

  async getAllMangas(): Promise<Manga[]> {
    return this.remote.getAllMangas();
  }

  async getMangaDetail(slug: string, mangaId: string): Promise<Manga> {
    return this.remote.getMangaDetail(slug, mangaId);
  }
}
