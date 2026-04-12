/**
 * GetCreatorEarnings Use Case - Get total earnings for a period
 */

import { ICreatorRepository } from '../repositories';

export class GetCreatorEarnings {
  constructor(private creatorRepository: ICreatorRepository) {}

  async execute(
    creatorId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<number> {
    return this.creatorRepository.getCreatorEarnings(creatorId, startDate, endDate);
  }
}
