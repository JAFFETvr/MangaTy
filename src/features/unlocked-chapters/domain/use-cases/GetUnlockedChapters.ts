/**
 * GetUnlockedChapters Use Case
 */

import { UnlockedChapter } from '../entities';
import { IUnlockedChapterRepository } from '../repositories';

export class GetUnlockedChapters {
  constructor(private repository: IUnlockedChapterRepository) {}

  async execute(userId: string): Promise<UnlockedChapter[]> {
    return this.repository.getUnlockedChapters(userId);
  }

  async executeForManga(userId: string, mangaId: number): Promise<number[]> {
    return this.repository.getUnlockedChaptersForManga(userId, mangaId);
  }
}
