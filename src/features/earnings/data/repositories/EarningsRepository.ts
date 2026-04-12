/**
 * EarningsRepository - Implementation of IEarningsRepository
 */

import { CreatorEarnings, CreatorWallet } from '../../domain/entities';
import { IEarningsRepository } from '../../domain/repositories';
import { EarningsLocalDataSource } from '../datasources/EarningsLocalDataSource';

export class EarningsRepository implements IEarningsRepository {
  constructor(private dataSource: EarningsLocalDataSource) {}

  async recordChapterPurchase(
    creatorId: string,
    mangaId: number,
    chapterNumber: number,
    userId: string,
    coinsPaid: number,
    amountMXN: number
  ): Promise<CreatorEarnings> {
    return this.dataSource.recordChapterPurchase(
      creatorId,
      mangaId,
      chapterNumber,
      userId,
      coinsPaid,
      amountMXN
    );
  }

  async getCreatorEarnings(
    creatorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CreatorEarnings[]> {
    return this.dataSource.getCreatorEarnings(creatorId, startDate, endDate);
  }

  async getCreatorWallet(creatorId: string): Promise<CreatorWallet> {
    return this.dataSource.getCreatorWallet(creatorId);
  }

  async calculatePendingPayout(creatorId: string): Promise<number> {
    return this.dataSource.calculatePendingPayout(creatorId);
  }

  async getTotalRevenue(creatorId: string): Promise<number> {
    return this.dataSource.getTotalRevenue(creatorId);
  }
}
