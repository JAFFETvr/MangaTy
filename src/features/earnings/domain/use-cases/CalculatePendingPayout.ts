/**
 * CalculatePendingPayout Use Case
 */

import { IEarningsRepository } from '../repositories';

export class CalculatePendingPayout {
  constructor(private earningsRepository: IEarningsRepository) {}

  async execute(creatorId: string): Promise<number> {
    return this.earningsRepository.calculatePendingPayout(creatorId);
  }

  async canPayout(creatorId: string, minimumPayout: number = 100): Promise<boolean> {
    const pending = await this.execute(creatorId);
    return pending >= minimumPayout;
  }
}
