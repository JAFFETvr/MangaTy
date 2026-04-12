/**
 * GetHistory UseCase
 */

import { Manga } from '@/src/features/manga/domain/entities';
import { ReadingHistory } from '../entities';
import { IHistoryRepository } from '../repositories/history-repository';

export class GetHistory {
  constructor(private repository: IHistoryRepository) {}

  async execute(): Promise<(ReadingHistory & { manga: Manga })[]> {
    return this.repository.getHistory();
  }
}
