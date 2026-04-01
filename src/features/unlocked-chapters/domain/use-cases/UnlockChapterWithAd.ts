/**
 * UnlockChapterWithAd Use Case
 */

import { UnlockedChapter } from '../entities';
import { IUnlockedChapterRepository } from '../repositories';

export class UnlockChapterWithAd {
  constructor(private repository: IUnlockedChapterRepository) {}

  async execute(
    userId: string,
    mangaId: number,
    chapterNumber: number
  ): Promise<UnlockedChapter> {
    // Check if already unlocked
    const isUnlocked = await this.repository.isChapterUnlocked(userId, mangaId, chapterNumber);
    if (isUnlocked) {
      throw new Error('Este capítulo ya está desbloqueado');
    }

    return this.repository.unlockChapterWithAd(userId, mangaId, chapterNumber);
  }
}
