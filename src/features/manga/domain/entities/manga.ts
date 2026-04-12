/**
 * Manga Entity - alineada con GET /api/comics/{slug}
 * Campos reales de la API.
 */

import { Chapter } from './chapter';

export interface Manga {
  id: string;             // UUID - se usa para GET /comics/{id}/chapters
  title: string;
  slug: string;           // Se usa para GET /comics/{slug}
  synopsis: string;
  genre: string;          // API devuelve género(s) (string separado por comas si hay varios)
  mature: boolean;
  viewsCount: number;
  coverImagePath: string; // Ruta relativa; construir URL con buildCoverUrl()
  creatorName: string;
  createdAt: string;      // ISO 8601
  chaptersData: Chapter[];
}
