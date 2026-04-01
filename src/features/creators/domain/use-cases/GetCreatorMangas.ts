/**
 * GetCreatorMangas Use Case - Get all manga IDs for a creator
 */

import { ICreatorRepository } from '../repositories';

export class GetCreatorMangas {
  constructor(private creatorRepository: ICreatorRepository) {}

  async execute(creatorId: string): Promise<number[]> {
    return this.creatorRepository.getCreatorMangaIds(creatorId);
  }
}
