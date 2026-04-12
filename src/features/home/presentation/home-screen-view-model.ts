/**
 * Home Screen View Model
 * Maneja la lógica de carga de comics para el home screen
 */

import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { MangaRemoteDataSource } from '@/src/features/manga/data/datasources/manga-remote-datasource';
import { Manga } from '@/src/features/manga/domain/entities/manga';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HomeScreenState {
  featuredComics: Manga[];
  myComics: Manga[];
  categoryComics: { [key: string]: Manga[] };
  loading: boolean;
  error: string | null;
}

export class HomeScreenViewModel {
  private dataSource: MangaRemoteDataSource;
  private state: HomeScreenState = {
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

      // Cargar comics publicados
      const allComics = await this.dataSource.getPublishedComics(0, 50);

      // Los primeros 4 como featured
      const featured = allComics.slice(0, 4);

      // Cargar mis comics si está autenticado
      let myComics: Manga[] = [];
      const userId = await TokenStorageService.getUserId();
      if (userId) {
        myComics = await this.loadMyComics(userId);
      }

      // Preparar comics por categoría (usando datos disponibles)
      const categoryComics = this.organizeComicsByGenre(allComics);

      this.setState({
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
          slug: `manga-${w.id}`,
          synopsis: w.description || '',
          genre: w.genres ? w.genres.join(', ') : '',
          mature: false,
          viewsCount: 0,
          coverImagePath: w.coverImage || '',
          creatorName: 'Tu Webcomic',
          createdAt: new Date().toISOString(),
          chaptersData: [],
        }));
      }
    } catch (error) {
      console.warn('⚠️ Error loading local webcomics:', error);
    }
    return [];
  }

  /**
   * Fallback: cargar webcomics locales si falla la API
   */
  private async loadLocalWebcomics(): Promise<void> {
    try {
      const userId = await TokenStorageService.getUserId();
      if (!userId) return;

      const storageKey = `@mangaty_${userId}_webcomics`;
      const storedStr = await AsyncStorage.getItem(storageKey);
      if (storedStr) {
        const webcomics = JSON.parse(storedStr);
        const myComics = webcomics.map((w: any) => ({
          id: w.id,
          title: w.title,
          slug: `manga-${w.id}`,
          synopsis: w.description || '',
          genre: w.genres ? w.genres.join(', ') : '',
          mature: false,
          viewsCount: 0,
          coverImagePath: w.coverImage || '',
          creatorName: 'Tu Webcomic',
          createdAt: new Date().toISOString(),
          chaptersData: [],
        }));

        this.setState({
          myComics,
          loading: false,
          error: 'Mostrando webcomics locales',
        });
      }
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
