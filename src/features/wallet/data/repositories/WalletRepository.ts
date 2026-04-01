/**
 * WalletRepository - Implementation of IWalletRepository
 */

import { WalletTransaction } from '../../domain/entities';
import { IWalletRepository } from '../../domain/repositories';
import { WalletLocalDataSource } from '../datasources/WalletLocalDataSource';

export class WalletRepository implements IWalletRepository {
  constructor(private dataSource: WalletLocalDataSource) {}

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    return this.dataSource.getTransactions(userId);
  }

  async getRecentTransactions(userId: string, limit: number): Promise<WalletTransaction[]> {
    return this.dataSource.getRecentTransactions(userId, limit);
  }

  async recordPurchase(
    userId: string,
    coins: number,
    amountMXN: number,
    packageId: string
  ): Promise<WalletTransaction> {
    return this.dataSource.recordPurchase(userId, coins, amountMXN, packageId);
  }

  async recordSpend(
    userId: string,
    coins: number,
    amountMXN: number,
    mangaId: number,
    chapterNumber: number,
    creatorId: string
  ): Promise<WalletTransaction> {
    return this.dataSource.recordSpend(
      userId,
      coins,
      amountMXN,
      mangaId,
      chapterNumber,
      creatorId
    );
  }

  async recordReward(userId: string, coins: number): Promise<WalletTransaction> {
    return this.dataSource.recordReward(userId, coins);
  }
}
