/**
 * AddToHistory UseCase
 */

import { IHistoryRepository } from '../repositories/history-repository';

export class AddToHistory {
  constructor(private repository: IHistoryRepository) {}

  async execute(mangaId: string, chapterNumber: number, progress: number): Promise<void> {
    return this.repository.addToHistory(mangaId, chapterNumber, progress);
  }
}
