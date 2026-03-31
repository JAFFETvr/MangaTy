/**
 * History Local DataSource
 */

import { MangaLocalDataSource } from '@/src/features/manga/data/datasources/manga-local-datasource';
import { Manga } from '@/src/features/manga/domain/entities';
import { ReadingHistory } from '../../domain/entities';

export class HistoryLocalDataSource {
  private history: ReadingHistory[] = [];
  private mangaDataSource: MangaLocalDataSource;

  constructor() {
    this.mangaDataSource = new MangaLocalDataSource();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock data for demo
    this.history = [
      {
        mangaId: 1,
        chapterNumber: 45,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        progress: 75,
      },
      {
        mangaId: 2,
        chapterNumber: 120,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        progress: 60,
      },
    ];
  }

  async getHistory(): Promise<(ReadingHistory & { manga: Manga })[]> {
    const allMangas = await this.mangaDataSource.getAllMangas();
    return this.history
      .map((h) => ({
        ...h,
        manga: allMangas.find((m) => m.id === h.mangaId)!,
      }))
      .filter((h) => h.manga)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async addToHistory(mangaId: number, chapterNumber: number, progress: number): Promise<void> {
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
