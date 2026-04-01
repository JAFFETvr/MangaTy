/**
 * IWalletRepository - Repository interface for wallet transactions
 */

import { WalletTransaction } from '../entities';

export interface IWalletRepository {
  /**
   * Get all transactions for a user
   */
  getTransactions(userId: string): Promise<WalletTransaction[]>;
  
  /**
   * Get recent transactions (limit)
   */
  getRecentTransactions(userId: string, limit: number): Promise<WalletTransaction[]>;
  
  /**
   * Record a purchase transaction
   */
  recordPurchase(
    userId: string,
    coins: number,
    amountMXN: number,
    packageId: string
  ): Promise<WalletTransaction>;
  
  /**
   * Record a spend transaction
   */
  recordSpend(
    userId: string,
    coins: number,
    amountMXN: number,
    mangaId: number,
    chapterNumber: number,
    creatorId: string
  ): Promise<WalletTransaction>;
  
  /**
   * Record a reward transaction (from ads)
   */
  recordReward(userId: string, coins: number): Promise<WalletTransaction>;
}
