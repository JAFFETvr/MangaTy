/**
 * WalletLocalDataSource - Mock storage for wallet transactions
 */

import { COIN_TO_MXN } from '@/src/features/coins/domain/entities';
import { WalletTransaction } from '../../domain/entities';

export class WalletLocalDataSource {
  private transactions: WalletTransaction[] = [];

  /**
   * Simula latencia de red
   */
  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    await this.delay(150);
    return this.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentTransactions(userId: string, limit: number): Promise<WalletTransaction[]> {
    await this.delay(150);
    return this.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async recordPurchase(
    userId: string,
    coins: number,
    amountMXN: number,
    packageId: string
  ): Promise<WalletTransaction> {
    await this.delay(200);

    const transaction: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'buy',
      coins,
      amountMXN,
      metadata: {
        packageId,
        description: `Compra de ${coins} monedas`,
      },
      createdAt: new Date(),
    };

    this.transactions.push(transaction);
    console.log(`[Wallet] Purchase recorded: ${coins} coins for $${amountMXN} MXN`);
    return transaction;
  }

  async recordSpend(
    userId: string,
    coins: number,
    amountMXN: number,
    mangaId: number,
    chapterNumber: number,
    creatorId: string
  ): Promise<WalletTransaction> {
    await this.delay(200);

    const transaction: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'spend',
      coins,
      amountMXN,
      metadata: {
        mangaId,
        chapterNumber,
        creatorId,
        description: `Capítulo ${chapterNumber} desbloqueado`,
      },
      createdAt: new Date(),
    };

    this.transactions.push(transaction);
    console.log(`[Wallet] Spend recorded: ${coins} coins ($${amountMXN} MXN) for manga ${mangaId} chapter ${chapterNumber}`);
    return transaction;
  }

  async recordReward(userId: string, coins: number): Promise<WalletTransaction> {
    await this.delay(200);

    const amountMXN = coins * COIN_TO_MXN;

    const transaction: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'reward',
      coins,
      amountMXN,
      metadata: {
        description: `Recompensa por ver anuncio: ${coins} monedas`,
      },
      createdAt: new Date(),
    };

    this.transactions.push(transaction);
    console.log(`[Wallet] Reward recorded: ${coins} coins`);
    return transaction;
  }
}
