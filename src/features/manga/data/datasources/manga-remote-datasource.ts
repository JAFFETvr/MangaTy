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
import {
  getUsernameByUserIdStorageKey,
  getUserWebcomicsStorageKey,
  loadPublicWebcomics,
  registerUniqueMangaView,
} from '@/src/core/storage/local-webcomic-storage';

export class MangaRemoteDataSource {
  private resolveCreatorName(item: any): string {
    const creatorName =
      item?.creatorName ??
      item?.creator?.name ??
      item?.creator?.username ??
      item?.artistName ??
      '';

    return typeof creatorName === 'string' ? creatorName.trim() : '';
  }

  private async fetchPublicJson(url: string): Promise<any> {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'omit',
    });

    if (!res.ok) {
      throw new Error(`Error al obtener comics: ${res.status}`);
    }

    return res.json();
  }

  private async fetchComicWithoutIncrement(mangaId: string, slug: string): Promise<any | null> {
    try {
      const json = await this.fetchPublicJson(`${API_BASE}/comics?page=0&size=100`);
      const list: any[] = Array.isArray(json)
        ? json
        : (json.content ?? json.data ?? json.comics ?? []);
      const targetById = list.find((item) => String(item?.id) === String(mangaId));
      if (targetById) return targetById;
      const targetBySlug = list.find((item) => String(item?.slug) === String(slug));
      return targetBySlug ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Carga el detalle de un comic y sus capítulos en paralelo.
   * @param slug  – campo `slug` del listado (GET /api/comics/{slug})
   * @param mangaId – campo `id` (UUID) del listado (GET /api/comics/{id}/chapters)
   */
  async getMangaDetail(slug: string | undefined, mangaId: string): Promise<Manga> {
    const safeSlug = slug ?? '';
    // Detectar webcomic local (prefijo reservado)
    const isLocalWebcomic = safeSlug.startsWith('local-');

    if (isLocalWebcomic) {
      // Ir directo a AsyncStorage para webcomics locales
      return this.getMangaDetailFromCache(mangaId);
    }

    const comicIdentifier = safeSlug || mangaId;

    try {
      const isFirstViewForUser = await registerUniqueMangaView(mangaId);
      let comic: any = null;

      if (isFirstViewForUser) {
        const comicRes = await fetch(`${API_BASE}/comics/${comicIdentifier}`);
        if (!comicRes.ok) {
          throw new Error('API comic detail error - trying fallback');
        }
        const comicJson = await comicRes.json();
        comic = comicJson.data ?? comicJson;
      } else {
        comic = await this.fetchComicWithoutIncrement(mangaId, safeSlug);
        if (!comic) {
          const fallbackRes = await fetch(`${API_BASE}/comics/${comicIdentifier}`);
          if (!fallbackRes.ok) {
            throw new Error('API comic detail error - trying fallback');
          }
          const fallbackJson = await fallbackRes.json();
          comic = fallbackJson.data ?? fallbackJson;
        }
      }

      let rawChapters: any[] = [];
      try {
        const chaptersRes = await fetch(`${API_BASE}/comics/${mangaId}/chapters`);
        if (chaptersRes.ok) {
          const chaptersJson = await chaptersRes.json();
          rawChapters = Array.isArray(chaptersJson)
            ? chaptersJson
            : (chaptersJson.content ?? chaptersJson.data ?? chaptersJson.chapters ?? []);
        }
      } catch {
        rawChapters = [];
      }

      // Si API devuelve vacío pero existen capítulos en cache local para este mismo manga,
      // usar ese respaldo para mantener coherencia con historial/lector.
      if (rawChapters.length === 0) {
        const publicWebcomics = await loadPublicWebcomics();
        const localMatch = publicWebcomics.find((w: any) => String(w?.id) === String(mangaId));
        const localChapters = Array.isArray(localMatch?.chapters) ? localMatch.chapters : [];
        if (localChapters.length > 0) {
          rawChapters = localChapters;
        }
      }

      const chapters: Chapter[] = rawChapters.map((cap: any) => ({
        id: cap.id ?? cap.chapterId,
        chapterNumber: cap.chapterNumber ?? cap.number ?? 1,
        title: cap.title ?? `Capítulo ${cap.chapterNumber ?? cap.number ?? ''}`.trim(),
        premium: cap.premium ?? cap.isPremium ?? false,
        priceTyCoins: cap.priceTyCoins ?? cap.price ?? 0,
        publishedAt: cap.publishedAt ?? '',
      }))
        .filter((cap) => Boolean(cap.id))
        .sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0));

      const manga: Manga = {
        id: comic.id,
        title: comic.title,
        slug: comic.slug,
        synopsis: comic.synopsis ?? '',
        genre: comic.genre ?? '',
        mature: comic.mature ?? false,
        viewsCount: comic.viewsCount ?? 0,
        coverImagePath: comic.coverImagePath ?? '',
        creatorName: this.resolveCreatorName(comic),
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

      let webcomic: any | undefined;

      const rawTargetId = String(mangaId);
      const targetId = rawTargetId.startsWith('local-') ? rawTargetId.replace('local-', '') : rawTargetId;

      if (userId) {
        const userStorageKey = getUserWebcomicsStorageKey(userId);
        const storedStr = await AsyncStorage.getItem(userStorageKey);
        if (storedStr) {
          const webcomics = JSON.parse(storedStr);
          webcomic = webcomics.find((w: any) => String(w.id) === targetId);
        }
      }

      if (!webcomic) {
        const publicWebcomics = await loadPublicWebcomics();
        webcomic = publicWebcomics.find((w: any) => String(w.id) === targetId);
      }

      if (!webcomic) {
        const legacyStored = await AsyncStorage.getItem('@mock_created_webcomics');
        if (legacyStored) {
          const legacyWebcomics = JSON.parse(legacyStored);
          webcomic = legacyWebcomics.find((w: any) => String(w.id) === targetId);
        }
      }

      if (!webcomic) throw new Error('Comic no encontrado en cache');

      let resolvedCreatorName = webcomic.creatorName;
      if ((!resolvedCreatorName || resolvedCreatorName === 'Creador') && webcomic.creatorId) {
        resolvedCreatorName = await AsyncStorage.getItem(
          getUsernameByUserIdStorageKey(String(webcomic.creatorId)),
        );
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
        slug: `local-${webcomic.id}`,
        synopsis: webcomic.description,
        genre: Array.isArray(webcomic.genres) ? webcomic.genres.join(', ') : (webcomic.genres || ''),
        mature: false,
        viewsCount: webcomic.viewsCount ?? 0,
        coverImagePath: webcomic.coverImage || '',
        creatorName: resolvedCreatorName || 'Creador',
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
    const json = await this.fetchPublicJson(`${API_BASE}/comics?page=0&size=100`);
    const list: any[] = Array.isArray(json)
      ? json
      : (json.content ?? json.data ?? json.comics ?? []);

    return list.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      synopsis: item.synopsis ?? '',
      genre: item.genre ?? '',
      mature: item.mature ?? false,
      viewsCount: item.viewsCount ?? 0,
      coverImagePath: item.coverImagePath ?? '',
      creatorName: this.resolveCreatorName(item),
      createdAt: item.createdAt ?? '',
      chaptersData: [],
    }));
  }

  /**
   * Obtiene todos los comics publicados con paginación
   * Útil para home screen con limit/offset
   */
  async getPublishedComics(page: number = 0, size: number = 20): Promise<Manga[]> {
    const json = await this.fetchPublicJson(`${API_BASE}/comics?page=${page}&size=${size}`);
    
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
      creatorName: this.resolveCreatorName(item),
      createdAt: item.createdAt ?? '',
      chaptersData: [],
    }));
  }
}
