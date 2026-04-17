/**
 * Home Screen View Model
 * Maneja la lógica de carga de comics para el home screen
 */

import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { loadPublicWebcomics } from '@/src/core/storage/local-webcomic-storage';
import { MangaRemoteDataSource } from '@/src/features/manga/data/datasources/manga-remote-datasource';
import { Manga } from '@/src/features/manga/domain/entities/manga';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HomeScreenState {
  allComics: Manga[];
  featuredComics: Manga[];
  myComics: Manga[];
  categoryComics: { [key: string]: Manga[] };
  loading: boolean;
  error: string | null;
}

export class HomeScreenViewModel {
  private dataSource: MangaRemoteDataSource;
  private state: HomeScreenState = {
    allComics: [],
    featuredComics: [],
    myComics: [],
    categoryComics: {},
    loading: true,
    error: null,
  };
  private stateListener: ((state: HomeScreenState) => void) | null = null;

  constructor(dataSource: MangaRemoteDataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Suscribirse a cambios de estado
   */
  subscribe(listener: (state: HomeScreenState) => void): () => void {
    this.stateListener = listener;
    listener(this.state);
    return () => {
      this.stateListener = null;
    };
  }

  /**
   * Obtener estado actual
   */
  getState(): HomeScreenState {
    return this.state;
  }

  /**
   * Actualizar estado e notificar listeners
   */
  private setState(newState: Partial<HomeScreenState>): void {
    this.state = { ...this.state, ...newState };
    this.stateListener?.(this.state);
  }

  /**
   * Cargar todos los datos del home
   */
  async loadHomeData(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });

      // Cargar catálogo público de comics
      let allComics: Manga[] = [];
      try {
        allComics = await this.dataSource.getPublishedComics(0, 50);
      } catch {
        allComics = await this.dataSource.getAllMangas();
      }

      const publicLocalComics = this.mapLocalWebcomics(await loadPublicWebcomics());
      const combinedCatalog = this.sortByNewest(this.mergeCatalogs(publicLocalComics, allComics));

      // Los primeros 4 como featured
      const featured = combinedCatalog.slice(0, 4);

      // Cargar mis comics si está autenticado
      let myComics: Manga[] = [];
      const userId = await TokenStorageService.getUserId();
      if (userId) {
        myComics = await this.loadMyComics(userId);
      }

      // Preparar comics por categoría (usando datos disponibles)
      const categoryComics = this.organizeComicsByGenre(combinedCatalog);

      this.setState({
        allComics: combinedCatalog,
        featuredComics: featured,
        myComics,
        categoryComics,
        loading: false,
      });
    } catch (error: any) {
      console.error('❌ Error loading home data:', error);
      this.setState({
        loading: false,
        error: error.message || 'Error al cargar los datos',
      });

      // Fallback: cargar webcomics locales
      await this.loadLocalWebcomics();
    }
  }

  /**
   * Cargar comics del usuario autenticado
   */
  private async loadMyComics(userId: string): Promise<Manga[]> {
    try {
      // Usa userId como prefix en la clave para aislar por usuario
      const storageKey = `@mangaty_${userId}_webcomics`;
      const storedStr = await AsyncStorage.getItem(storageKey);
      if (storedStr) {
        const webcomics = JSON.parse(storedStr);
        return webcomics.map((w: any) => ({
          id: w.id,
          title: w.title,
          slug: `local-${w.id}`,
          synopsis: w.description || '',
          genre: Array.isArray(w.genres) ? w.genres.join(', ') : (w.genres || ''),
          mature: false,
          viewsCount: w.viewsCount ?? 0,
          coverImagePath: w.coverImage || '',
          creatorName: 'Tu Webcomic',
          createdAt: w.createdAt || new Date().toISOString(),
          chaptersData: [],
        }));
      }
    } catch (error) {
      console.warn('⚠️ Error loading local webcomics:', error);
    }
    return [];
  }

  private mapLocalWebcomics(webcomics: any[]): Manga[] {
    return webcomics.map((w: any) => ({
      id: w.id,
      title: w.title,
      slug: w.slug || `local-${w.id}`,
      synopsis: w.description || '',
      genre: Array.isArray(w.genres) ? w.genres.join(', ') : (w.genres || ''),
      mature: false,
      viewsCount: w.viewsCount ?? 0,
      coverImagePath: w.coverImage || '',
      creatorName: w.creatorName || 'Creador',
      createdAt: w.createdAt || new Date().toISOString(),
      chaptersData: Array.isArray(w.chapters) ? w.chapters : [],
    }));
  }

  private mergeCatalogs(localComics: Manga[], apiComics: Manga[]): Manga[] {
    const merged = new Map<string, Manga>();
    for (const comic of localComics) {
      merged.set(String(comic.id), comic);
    }
    for (const comic of apiComics) {
      // Si existe duplicado (mismo id), priorizar el registro de API
      // para usar slug/estado/capítulos publicados más confiables.
      merged.set(String(comic.id), comic);
    }
    return Array.from(merged.values());
  }

  private sortByNewest(comics: Manga[]): Manga[] {
    return [...comics].sort((a, b) => {
      const aRaw = new Date(a.createdAt || '').getTime();
      const bRaw = new Date(b.createdAt || '').getTime();
      const aTime = Number.isFinite(aRaw) ? aRaw : 0;
      const bTime = Number.isFinite(bRaw) ? bRaw : 0;
      return bTime - aTime;
    });
  }

  /**
   * Fallback: cargar webcomics locales si falla la API
   */
  private async loadLocalWebcomics(): Promise<void> {
    try {
      const userId = await TokenStorageService.getUserId();
      const publicLocalComics = this.mapLocalWebcomics(await loadPublicWebcomics());
      const myComics = userId ? await this.loadMyComics(userId) : [];

      this.setState({
        allComics: publicLocalComics,
        featuredComics: publicLocalComics.slice(0, 4),
        myComics,
        categoryComics: this.organizeComicsByGenre(publicLocalComics),
        loading: false,
        error: 'Mostrando webcomics locales',
      });
    } catch (error) {
      console.error('❌ Error loading fallback data:', error);
    }
  }

  /**
   * Organizar comics por género
   */
  private organizeComicsByGenre(comics: Manga[]): { [key: string]: Manga[] } {
    const genres = ['Romance', 'GL', 'BL', 'Drama', 'Fantasía', 'Acción'];
    const result: { [key: string]: Manga[] } = {};

    genres.forEach((genre) => {
      result[genre] = comics.filter((c) =>
        c.genre.toLowerCase().includes(genre.toLowerCase())
      );
    });

    return result;
  }

  /**
   * Recargar datos
   */
  async refresh(): Promise<void> {
    await this.loadHomeData();
  }
}
