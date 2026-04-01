/**
 * GetWalletTransactions - Get all wallet transactions for a user
 */

import { WalletTransaction } from '../entities';
import { IWalletRepository } from '../repositories';

export class GetWalletTransactions {
  constructor(private repository: IWalletRepository) {}

  async execute(userId: string): Promise<WalletTransaction[]> {
    return this.repository.getTransactions(userId);
  }
}
