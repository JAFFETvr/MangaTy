/**
 * History Local DataSource
 */

import { MangaRemoteDataSource } from '@/src/features/manga/data/datasources/manga-remote-datasource';
import { Manga } from '@/src/features/manga/domain/entities';
import { ReadingHistory } from '../../domain/entities';

export class HistoryLocalDataSource {
  private history: ReadingHistory[] = [];
  private mangaDataSource: MangaRemoteDataSource;

  constructor() {
    this.mangaDataSource = new MangaRemoteDataSource();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock data for demo - Using slugs and IDs that match potential API responses or allow navigation
    this.history = [
      {
        mangaId: 'sakura-uuid',
        chapterNumber: 3,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        progress: 75,
      },
      {
        mangaId: 'demon-uuid',
        chapterNumber: 1,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        progress: 100,
      },
    ];
  }

  async getHistory(): Promise<(ReadingHistory & { manga: Manga })[]> {
    // Para el historial, necesitamos los objetos Manga reales para poder navegar por slug e ID
    // En una app real, esto podría requerir un endpoint de "get multiple mangas by ids"
    // Por ahora, usamos el listado general del home si está disponible
    const allMangas = await this.mangaDataSource.getAllMangas().catch(() => []);
    
    // Si no hay mangas (ej: API caída), creamos objetos mínimos para que al menos se vea algo y permita intentar navegar
    return this.history
      .map((h) => {
        const found = allMangas.find((m) => m.id === h.mangaId);
        if (found) return { ...h, manga: found };
        
        // Fallback mock para los datos iniciales o si la API no devuelve ese ID
        let mockManga: Manga = {
          id: h.mangaId,
          title: h.mangaId === 'sakura-uuid' ? 'Sakura Chronicles' : 'Manga Desconocido',
          slug: h.mangaId === 'sakura-uuid' ? 'sakura-chronicles' : 'desconocido',
          coverImagePath: '',
          creatorName: 'Autor',
          idSlug: '', // deprecated or unused
          chaptersData: [],
          createdAt: new Date().toISOString(),
          genre: 'Varios',
          mature: false,
          synopsis: '',
          viewsCount: 0
        } as any;
        
        return { ...h, manga: mockManga };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addToHistory(mangaId: string, chapterNumber: number, progress: number): Promise<void> {
    const existingIndex = this.history.findIndex((h) => h.mangaId === mangaId);
    if (existingIndex >= 0) {
      this.history[existingIndex] = {
        mangaId,
        chapterNumber,
        progress,
        timestamp: new Date(),
      };
    } else {
      this.history.push({
        mangaId,
        chapterNumber,
        progress,
        timestamp: new Date(),
      });
    }
  }

  async clearHistory(): Promise<void> {
    this.history = [];
  }
}
