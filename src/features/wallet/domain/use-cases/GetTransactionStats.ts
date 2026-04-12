/**
 * GetTransactionStats - Get transaction statistics for a user
 */

import { WalletStats } from '../../presentation/view-models/WalletViewModel';
import { IWalletRepository } from '../repositories';

export class GetTransactionStats {
  constructor(private repository: IWalletRepository) {}

  async execute(userId: string): Promise<WalletStats> {
    const transactions = await this.repository.getTransactions(userId);
    
    let totalPurchased = 0;
    let totalSpent = 0;
    let totalRewarded = 0;

    for (const tx of transactions) {
      switch (tx.type) {
        case 'buy':
          totalPurchased += tx.coins;
          break;
        case 'spend':
          totalSpent += tx.coins;
          break;
        case 'reward':
          totalRewarded += tx.coins;
          break;
      }
    }

    return { totalPurchased, totalSpent, totalRewarded };
  }
}
