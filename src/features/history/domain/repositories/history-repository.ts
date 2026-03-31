/**
 * History Repository Interface
 */

import { Manga } from '@/src/features/manga/domain/entities';
import { ReadingHistory } from '../entities';

export interface IHistoryRepository {
  getHistory(): Promise<(ReadingHistory & { manga: Manga })[]>;
  addToHistory(mangaId: number, chapterNumber: number, progress: number): Promise<void>;
  clearHistory(): Promise<void>;
}
