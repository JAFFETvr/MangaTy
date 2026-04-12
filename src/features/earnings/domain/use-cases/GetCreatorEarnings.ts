/**
 * GetCreatorEarnings Use Case
 */

import { CreatorEarnings } from '../entities';
import { IEarningsRepository } from '../repositories';

export class GetCreatorEarnings {
  constructor(private earningsRepository: IEarningsRepository) {}

  async execute(creatorId: string, startDate?: Date, endDate?: Date): Promise<CreatorEarnings[]> {
    return this.earningsRepository.getCreatorEarnings(creatorId, startDate, endDate);
  }
}
