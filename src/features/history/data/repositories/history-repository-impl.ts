/**
 * History Repository Implementation
 */

import { Manga } from '@/src/features/manga/domain/entities';
import { ReadingHistory } from '../../domain/entities';
import { IHistoryRepository } from '../../domain/repositories/history-repository';
import { HistoryLocalDataSource } from '../datasources/history-local-datasource';

export class HistoryRepositoryImpl implements IHistoryRepository {
  constructor(private dataSource: HistoryLocalDataSource) {}

  async getHistory(): Promise<(ReadingHistory & { manga: Manga })[]> {
    return this.dataSource.getHistory();
  }

  async addToHistory(mangaId: string, chapterNumber: number, progress: number): Promise<void> {
    return this.dataSource.addToHistory(mangaId, chapterNumber, progress);
  }

  async clearHistory(): Promise<void> {
    return this.dataSource.clearHistory();
  }
}
