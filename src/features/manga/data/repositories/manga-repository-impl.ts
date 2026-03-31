/**
 * Manga Repository Implementation
 */

import { Manga } from '../../domain/entities';
import { IMangaRepository } from '../../domain/repositories/manga-repository';
import { MangaLocalDataSource } from '../datasources/manga-local-datasource';

export class MangaRepositoryImpl implements IMangaRepository {
  constructor(private dataSource: MangaLocalDataSource) {}

  async getAllMangas(): Promise<Manga[]> {
    return this.dataSource.getAllMangas();
  }

  async getMangaById(id: number): Promise<Manga | null> {
    return this.dataSource.getMangaById(id);
  }

  async searchMangas(query: string): Promise<Manga[]> {
    return this.dataSource.searchMangas(query);
  }
}
