/**
 * UnlockedChapterLocalDataSource - Mock storage for unlocked chapters
 */

import { UnlockedChapter } from '../../domain/entities';

export class UnlockedChapterLocalDataSource {
  private unlockedChapters: UnlockedChapter[] = [];

  /**
   * Simula latencia de red
   */
  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getUnlockedChapters(userId: string): Promise<UnlockedChapter[]> {
    await this.delay(150);
    return this.unlockedChapters.filter((uc) => uc.userId === userId);
  }

  async isChapterUnlocked(
    userId: string,
    mangaId: number,
    chapterNumber: number
  ): Promise<boolean> {
    await this.delay(100);
    return this.unlockedChapters.some(
      (uc) =>
        uc.userId === userId &&
        uc.mangaId === mangaId &&
        uc.chapterNumber === chapterNumber
    );
  }

  async unlockChapterWithCoins(
    userId: string,
    mangaId: number,
    chapterNumber: number,
    cost: number
  ): Promise<UnlockedChapter> {
    await this.delay(250);

    const unlockedChapter: UnlockedChapter = {
      id: `unlock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      mangaId,
      chapterNumber,
      unlockedAt: new Date(),
      paidAmount: cost,
      method: 'coins',
    };

    this.unlockedChapters.push(unlockedChapter);
    console.log(`[UnlockedChapter] User ${userId} unlocked manga ${mangaId} chapter ${chapterNumber} with ${cost} coins`);
    return unlockedChapter;
  }

  async unlockChapterWithAd(
    userId: string,
    mangaId: number,
    chapterNumber: number
  ): Promise<UnlockedChapter> {
    await this.delay(250);

    const unlockedChapter: UnlockedChapter = {
      id: `unlock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      mangaId,
      chapterNumber,
      unlockedAt: new Date(),
      paidAmount: 0,
      method: 'ad',
    };

    this.unlockedChapters.push(unlockedChapter);
    console.log(`[UnlockedChapter] User ${userId} unlocked manga ${mangaId} chapter ${chapterNumber} with ad`);
    return unlockedChapter;
  }

  async getUnlockedChaptersForManga(userId: string, mangaId: number): Promise<number[]> {
    await this.delay(100);
    return this.unlockedChapters
      .filter((uc) => uc.userId === userId && uc.mangaId === mangaId)
      .map((uc) => uc.chapterNumber);
  }
}
