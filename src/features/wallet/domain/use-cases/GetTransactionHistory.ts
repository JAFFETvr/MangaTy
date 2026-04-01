/**
 * GetTransactionHistory Use Case
 */

import { WalletTransaction } from '../entities';
import { IWalletRepository } from '../repositories';

export class GetTransactionHistory {
  constructor(private repository: IWalletRepository) {}

  async execute(userId: string, limit?: number): Promise<WalletTransaction[]> {
    if (limit) {
      return this.repository.getRecentTransactions(userId, limit);
    }
    return this.repository.getTransactions(userId);
  }
}
