/**
 * IMangaRepository - Abstracción del repositorio de manga en el dominio
 */

import { Manga } from '../entities';

export interface IMangaRepository {
  /** Lista pública de comics */
  getAllMangas(): Promise<Manga[]>;
  /** Detalle completo con capítulos: 2 llamadas en paralelo */
  getMangaDetail(slug: string, mangaId: string): Promise<Manga>;
}
