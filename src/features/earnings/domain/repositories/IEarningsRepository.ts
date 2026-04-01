/**
 * IEarningsRepository - Repository interface for creator earnings
 */

import { CreatorEarnings, CreatorWallet } from '../entities';

export interface IEarningsRepository {
  /**
   * Record a chapter purchase and calculate 80/20 split
   */
  recordChapterPurchase(
    creatorId: string,
    mangaId: number,
    chapterNumber: number,
    userId: string,
    coinsPaid: number,
    amountMXN: number
  ): Promise<CreatorEarnings>;
  
  /**
   * Get earnings for a creator
   */
  getCreatorEarnings(creatorId: string, startDate?: Date, endDate?: Date): Promise<CreatorEarnings[]>;
  
  /**
   * Get creator wallet
   */
  getCreatorWallet(creatorId: string): Promise<CreatorWallet>;
  
  /**
   * Calculate pending payout for creator
   */
  calculatePendingPayout(creatorId: string): Promise<number>;
  
  /**
   * Get total revenue for creator
   */
  getTotalRevenue(creatorId: string): Promise<number>;
}
