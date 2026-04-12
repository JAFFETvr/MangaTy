/**
 * CheckChapterUnlocked Use Case
 */

import { IUnlockedChapterRepository } from '../repositories';

export class CheckChapterUnlocked {
  constructor(private repository: IUnlockedChapterRepository) {}

  async execute(userId: string, mangaId: number, chapterNumber: number): Promise<boolean> {
    return this.repository.isChapterUnlocked(userId, mangaId, chapterNumber);
  }
}
