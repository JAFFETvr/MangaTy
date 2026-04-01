/**
 * WalletTransaction Entity - Transaction history for user's wallet
 */

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'buy' | 'spend' | 'reward';
  coins: number;
  amountMXN: number;
  metadata: {
    packageId?: string;
    mangaId?: number;
    chapterNumber?: number;
    creatorId?: string;
    description?: string;
  };
  createdAt: Date;
}
