/**
 * GetCreatorById Use Case
 */

import { Creator } from '../entities';
import { ICreatorRepository } from '../repositories';

export class GetCreatorById {
  constructor(private creatorRepository: ICreatorRepository) {}

  async execute(creatorId: string): Promise<Creator | null> {
    return this.creatorRepository.getCreatorById(creatorId);
  }
}
