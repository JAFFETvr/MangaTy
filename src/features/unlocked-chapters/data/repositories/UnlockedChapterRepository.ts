/**
 * UnlockedChapterRepository - Implementation of IUnlockedChapterRepository
 */

import { UnlockedChapter } from '../../domain/entities';
import { IUnlockedChapterRepository } from '../../domain/repositories';
import { UnlockedChapterLocalDataSource } from '../datasources/UnlockedChapterLocalDataSource';

export class UnlockedChapterRepository implements IUnlockedChapterRepository {
  constructor(private dataSource: UnlockedChapterLocalDataSource) {}

  async getUnlockedChapters(userId: string): Promise<UnlockedChapter[]> {
    return this.dataSource.getUnlockedChapters(userId);
  }

  async isChapterUnlocked(
    userId: string,
    mangaId: number,
    chapterNumber: number
  ): Promise<boolean> {
    return this.dataSource.isChapterUnlocked(userId, mangaId, chapterNumber);
  }

  async unlockChapterWithCoins(
    userId: string,
    mangaId: number,
    chapterNumber: number,
    cost: number
  ): Promise<UnlockedChapter> {
    return this.dataSource.unlockChapterWithCoins(userId, mangaId, chapterNumber, cost);
  }

  async unlockChapterWithAd(
    userId: string,
    mangaId: number,
    chapterNumber: number
  ): Promise<UnlockedChapter> {
    return this.dataSource.unlockChapterWithAd(userId, mangaId, chapterNumber);
  }

  async getUnlockedChaptersForManga(userId: string, mangaId: number): Promise<number[]> {
    return this.dataSource.getUnlockedChaptersForManga(userId, mangaId);
  }
}
