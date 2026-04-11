/**
 * Manga Remote DataSource
 * Realiza 2 llamadas en paralelo:
 *   1. GET /api/comics/{slug}      → detalle del comic (también incrementa viewsCount)
 *   2. GET /api/comics/{id}/chapters → lista de capítulos PUBLISHED
 */

import { API_BASE } from '@/src/core/api/api-config';
import { Manga } from '../../domain/entities/manga';
import { Chapter } from '../../domain/entities/chapter';

export class MangaRemoteDataSource {
  /**
   * Carga el detalle de un comic y sus capítulos en paralelo.
   * @param slug  – campo `slug` del listado (GET /api/comics/{slug})
   * @param mangaId – campo `id` (UUID) del listado (GET /api/comics/{id}/chapters)
   */
  async getMangaDetail(slug: string, mangaId: string): Promise<Manga> {
    const [comicRes, chaptersRes] = await Promise.all([
      fetch(`${API_BASE}/comics/${slug}`),
      fetch(`${API_BASE}/comics/${mangaId}/chapters`),
    ]);

    if (!comicRes.ok) {
      throw new Error(`Error al obtener el comic: ${comicRes.status}`);
    }
    if (!chaptersRes.ok) {
      throw new Error(`Error al obtener capítulos: ${chaptersRes.status}`);
    }

    const comicJson = await comicRes.json();
    const chaptersJson = await chaptersRes.json();

    // La API puede devolver el objeto directamente o dentro de { data: ... }
    const comic = comicJson.data ?? comicJson;
    const rawChapters: any[] = Array.isArray(chaptersJson)
      ? chaptersJson
      : (chaptersJson.data ?? chaptersJson.chapters ?? []);

    const chapters: Chapter[] = rawChapters.map((cap: any) => ({
      id: cap.id,
      chapterNumber: cap.chapterNumber,
      title: cap.title,
      premium: cap.premium ?? false,
      priceTyCoins: cap.priceTyCoins ?? 0,
      publishedAt: cap.publishedAt ?? '',
    }));

    const manga: Manga = {
      id: comic.id,
      title: comic.title,
      slug: comic.slug,
      synopsis: comic.synopsis ?? '',
      genre: comic.genre ?? '',
      mature: comic.mature ?? false,
      viewsCount: comic.viewsCount ?? 0,
      coverImagePath: comic.coverImagePath ?? '',
      creatorName: comic.creatorName ?? '',
      createdAt: comic.createdAt ?? '',
      chaptersData: chapters,
    };

    return manga;
  }

  /**
   * GET /api/comics — lista pública de comics para el home/explorar
   */
  async getAllMangas(): Promise<Manga[]> {
    const res = await fetch(`${API_BASE}/comics`);
    if (!res.ok) throw new Error(`Error al obtener comics: ${res.status}`);
    const json = await res.json();
    const list: any[] = Array.isArray(json) ? json : (json.data ?? json.comics ?? []);

    return list.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      synopsis: item.synopsis ?? '',
      genre: item.genre ?? '',
      mature: item.mature ?? false,
      viewsCount: item.viewsCount ?? 0,
      coverImagePath: item.coverImagePath ?? '',
      creatorName: item.creatorName ?? '',
      createdAt: item.createdAt ?? '',
      chaptersData: [],
    }));
  }
}
