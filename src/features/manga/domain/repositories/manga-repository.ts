/**
 * Manga Repository Interface - Abstraction for manga data source
 * Defined in domain, implemented in data layer
 */

import { Manga } from '../entities';

export interface IMangaRepository {
  getAllMangas(): Promise<Manga[]>;
  getMangaById(id: number): Promise<Manga | null>;
  searchMangas(query: string): Promise<Manga[]>;
}
