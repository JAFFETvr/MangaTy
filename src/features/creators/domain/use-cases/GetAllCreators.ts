/**
 * GetAllCreators Use Case
 */

import { Creator } from '../entities';
import { ICreatorRepository } from '../repositories';

export class GetAllCreators {
  constructor(private creatorRepository: ICreatorRepository) {}

  async execute(): Promise<Creator[]> {
    return this.creatorRepository.getAllCreators();
  }
}
