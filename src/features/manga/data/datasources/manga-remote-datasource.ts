/**
 * Manga Remote DataSource
 * Realiza 2 llamadas en paralelo:
 *   1. GET /api/comics/{slug}      → detalle del comic (también incrementa viewsCount)
 *   2. GET /api/comics/{id}/chapters → lista de capítulos PUBLISHED
 *
 * Fallback: Si fail, intenta buscar en AsyncStorage para webcomics creados localmente
 */

import { API_BASE } from '@/src/core/api/api-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chapter } from '../../domain/entities/chapter';
import { Manga } from '../../domain/entities/manga';

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
      // Importar TokenStorageService para obtener el userId
      const { TokenStorageService } = await import('@/src/core/http/token-storage-service');
      const userId = await TokenStorageService.getUserId();
      
      // Usar la clave aislada por usuario
      const storageKey = userId ? `@mangaty_${userId}_webcomics` : '@mock_created_webcomics';
      const storedStr = await AsyncStorage.getItem(storageKey);
      
      if (!storedStr) {
        throw new Error('Comic no encontrado');
      }

      const webcomics = JSON.parse(storedStr);
      const webcomic = webcomics.find((w: any) => w.id === mangaId);

      if (!webcomic) {
        throw new Error('Comic no encontrado en cache');
      }

      // Mapear capítulos si existen
      const chapters: Chapter[] = (webcomic.chapters || []).map((cap: any) => ({
        id: cap.id,
        chapterNumber: cap.chapterNumber,
        title: cap.title,
        premium: cap.premium ?? false,
        priceTyCoins: cap.priceTyCoins ?? 0,
        publishedAt: cap.publishedAt ?? '',
      }));

      return {
        id: webcomic.id,
        title: webcomic.title,
        slug: `manga-${webcomic.id}`,
        synopsis: webcomic.description,
        genre: webcomic.genres ? webcomic.genres.join(', ') : '',
        mature: false,
        viewsCount: 0,
        coverImagePath: webcomic.coverImage || '',
        creatorName: 'Tu Webcomic',
        createdAt: new Date().toISOString(),
        chaptersData: chapters,
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

  /**
   * Obtiene todos los comics publicados con paginación
   * Útil para home screen con limit/offset
   */
  async getPublishedComics(page: number = 0, size: number = 20): Promise<Manga[]> {
    const res = await fetch(`${API_BASE}/comics?page=${page}&size=${size}`);
    if (!res.ok) throw new Error(`Error al obtener comics: ${res.status}`);
    const json = await res.json();
    
    // La API puede devolver { content: [...], pageable: {...}, ... }
    const list: any[] = json.content ?? (Array.isArray(json) ? json : (json.data ?? []));

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
