/**
 * CreatorRepository - Implementation of ICreatorRepository
 */

import { Creator } from '../../domain/entities';
import { ICreatorRepository } from '../../domain/repositories';
import { CreatorLocalDataSource } from '../datasources/CreatorLocalDataSource';

export class CreatorRepository implements ICreatorRepository {
  constructor(private dataSource: CreatorLocalDataSource) {}

  async getCreatorById(id: string): Promise<Creator | null> {
    return this.dataSource.getCreatorById(id);
  }

  async getAllCreators(): Promise<Creator[]> {
    return this.dataSource.getAllCreators();
  }

  async getCreatorMangaIds(creatorId: string): Promise<number[]> {
    return this.dataSource.getCreatorMangaIds(creatorId);
  }

  async updateCreator(creatorId: string, data: Partial<Creator>): Promise<Creator> {
    return this.dataSource.updateCreator(creatorId, data);
  }

  async addEarnings(creatorId: string, amount: number): Promise<void> {
    return this.dataSource.addEarnings(creatorId, amount);
  }

  async getCreatorEarnings(
    creatorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    return this.dataSource.getCreatorEarnings(creatorId, startDate, endDate);
  }
}
