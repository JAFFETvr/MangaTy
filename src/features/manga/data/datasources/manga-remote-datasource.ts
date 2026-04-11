/**
 * Manga Remote DataSource
 * Realiza 2 llamadas en paralelo:
 *   1. GET /api/comics/{slug}      → detalle del comic (también incrementa viewsCount)
 *   2. GET /api/comics/{id}/chapters → lista de capítulos PUBLISHED
 *
 * Fallback: Si fail, intenta buscar en AsyncStorage para webcomics creados localmente
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
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
    // Detectar si es un webcomic local (slug comienza con "manga-")
    const isLocalWebcomic = slug.startsWith('manga-');

    if (isLocalWebcomic) {
      // Ir directo a AsyncStorage para webcomics locales
      return this.getMangaDetailFromCache(mangaId);
    }

    try {
      const [comicRes, chaptersRes] = await Promise.all([
        fetch(`${API_BASE}/comics/${slug}`),
        fetch(`${API_BASE}/comics/${mangaId}/chapters`),
      ]);

      if (!comicRes.ok || !chaptersRes.ok) {
        throw new Error('API error - trying fallback');
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
    } catch (error) {
      // Fallback: Intenta obtener de AsyncStorage (webcomics creados localmente)
      return this.getMangaDetailFromCache(mangaId);
    }
  }

  /**
   * Fallback: Obtiene comic del cache local (AsyncStorage) para webcomics creados en-app
   */
  private async getMangaDetailFromCache(mangaId: string): Promise<Manga> {
    try {
      const storedStr = await AsyncStorage.getItem('@mock_created_webcomics');
      if (!storedStr) {
        throw new Error('Comic no encontrado');
      }

      const webcomics = JSON.parse(storedStr);
      const webcomic = webcomics.find((w: any) => w.id === mangaId);

      if (!webcomic) {
        throw new Error('Comic no encontrado en cache');
      }

      return {
        id: webcomic.id,
        title: webcomic.title,
        slug: `manga-${webcomic.id}`,
        synopsis: webcomic.description,
        genre: webcomic.genres && webcomic.genres.length > 0 ? webcomic.genres[0] : '',
        mature: false,
        viewsCount: 0,
        coverImagePath: webcomic.coverImage || '',
        creatorName: 'Tu Webcomic',
        createdAt: new Date().toISOString(),
        chaptersData: [],
      };
    } catch (error) {
      console.error('❌ Error al cargar comic:', error);
      throw new Error(`No se pudo cargar el comic`);
    }
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
