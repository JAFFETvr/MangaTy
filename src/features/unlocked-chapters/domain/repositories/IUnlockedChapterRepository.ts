/**
 * IUnlockedChapterRepository - Repository interface for unlocked chapters
 */

import { UnlockedChapter } from '../entities';

export interface IUnlockedChapterRepository {
  /**
   * Get all unlocked chapters for a user
   */
  getUnlockedChapters(userId: string): Promise<UnlockedChapter[]>;
  
  /**
   * Check if a specific chapter is unlocked
   */
  isChapterUnlocked(userId: string, mangaId: number, chapterNumber: number): Promise<boolean>;
  
  /**
   * Unlock a chapter with coins
   */
  unlockChapterWithCoins(
    userId: string,
    mangaId: number,
    chapterNumber: number,
    cost: number
  ): Promise<UnlockedChapter>;
  
  /**
   * Unlock a chapter by watching an ad
   */
  unlockChapterWithAd(
    userId: string,
    mangaId: number,
    chapterNumber: number
  ): Promise<UnlockedChapter>;
  
  /**
   * Get unlocked chapters for a specific manga
   */
  getUnlockedChaptersForManga(userId: string, mangaId: number): Promise<number[]>;
}
