/**
 * Wallet Remote DataSource
 * Handles wallet operations: balance, unlocking chapters, transactions
 */

import { httpClient } from '@/src/core/http/http-client';

interface WalletBalance {
  userId: string;
  tyCoins: number;
}

interface UnlockResponse {
  chapterId: string;
  tyCoinsSpent: number;
  newBalance: number;
  alreadyUnlocked: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface TransactionResponse {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
}

export class WalletRemoteDataSource {
  /**
   * Get current wallet balance
   */
  async getBalance(): Promise<number> {
    try {
      const response = await httpClient.get<WalletBalance>('/wallet/balance');
      return response.tyCoins;
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Unlock a chapter with TyCoins
   * Uses idempotency key to prevent double charges
   */
  async unlockChapter(chapterId: string, idempotencyKey: string): Promise<UnlockResponse> {
    try {
      const response = await httpClient.postWithHeaders<UnlockResponse>(
        `/wallet/unlock/${chapterId}`,
        {},
        { 'X-Idempotency-Key': idempotencyKey }
      );

      return response;
    } catch (error) {
      console.error('❌ Error unlocking chapter:', error);
      throw error;
    }
  }

  /**
   * Get wallet transaction history
   */
  async getTransactions(page: number = 0, size: number = 20): Promise<Transaction[]> {
    try {
      const response = await httpClient.get<TransactionResponse>(
        `/wallet/transactions?page=${page}&size=${size}`
      );
      return response.content;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }
  }
}

