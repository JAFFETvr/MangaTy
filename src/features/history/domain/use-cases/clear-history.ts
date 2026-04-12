/**
 * ClearHistory UseCase
 */

import { IHistoryRepository } from '../repositories/history-repository';

export class ClearHistory {
  constructor(private repository: IHistoryRepository) {}

  async execute(): Promise<void> {
    return this.repository.clearHistory();
  }
}
