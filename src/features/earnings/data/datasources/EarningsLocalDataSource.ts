/**
 * EarningsLocalDataSource - Mock storage for creator earnings
 * 
 * Este datasource maneja el sistema de ganancias 80/20
 */

import { CreatorEarnings, CreatorWallet } from '../../domain/entities';

export class EarningsLocalDataSource {
  private earnings: CreatorEarnings[] = [];
  private wallets: Map<string, CreatorWallet> = new Map();

  // Mínimo para hacer payout: $100 MXN
  private readonly MINIMUM_PAYOUT = 100;

  /**
   * Simula latencia de red
   */
  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Inicializa wallet de un creador si no existe
   */
  private ensureWallet(creatorId: string): void {
    if (!this.wallets.has(creatorId)) {
      this.wallets.set(creatorId, {
        creatorId,
        pendingBalance: 0,
        totalEarned: 0,
        lastPayoutAt: null,
        minimumPayout: this.MINIMUM_PAYOUT,
      });
    }
  }

  /**
   * Registra una compra de capítulo y calcula reparto 80/20
   */
  async recordChapterPurchase(
    creatorId: string,
    mangaId: number,
    chapterNumber: number,
    userId: string,
    coinsPaid: number,
    amountMXN: number
  ): Promise<CreatorEarnings> {
    await this.delay(250);

    this.ensureWallet(creatorId);

    // Calcular reparto 80/20
    const creatorRevenue = amountMXN * 0.80;  // 80% al creador
    const platformFee = amountMXN * 0.20;     // 20% a la plataforma
    const coinsEarned = Math.floor(coinsPaid * 0.80);  // 80% de las monedas

    const earning: CreatorEarnings = {
      id: `earn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      creatorId,
      mangaId,
      chapterNumber,
      userId,
      coinsEarned,
      amountMXN,
      platformFee,
      creatorRevenue,
      timestamp: new Date(),
      status: 'pending',
    };

    this.earnings.push(earning);

    // Actualizar wallet del creador
    const wallet = this.wallets.get(creatorId)!;
    wallet.pendingBalance += creatorRevenue;
    wallet.totalEarned += creatorRevenue;

    console.log(`[Earnings] Recorded earning for creator ${creatorId}:`);
    console.log(`  - Chapter: Manga ${mangaId}, Chapter ${chapterNumber}`);
    console.log(`  - Total paid: ${coinsPaid} coins ($${amountMXN} MXN)`);
    console.log(`  - Creator revenue (80%): $${creatorRevenue.toFixed(2)} MXN`);
    console.log(`  - Platform fee (20%): $${platformFee.toFixed(2)} MXN`);
    console.log(`  - Creator pending balance: $${wallet.pendingBalance.toFixed(2)} MXN`);

    return earning;
  }

  /**
   * Obtiene earnings de un creador
   */
  async getCreatorEarnings(
    creatorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CreatorEarnings[]> {
    await this.delay(150);

    let filtered = this.earnings.filter((e) => e.creatorId === creatorId);

    if (startDate) {
      filtered = filtered.filter((e) => e.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((e) => e.timestamp <= endDate);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtiene wallet de un creador
   */
  async getCreatorWallet(creatorId: string): Promise<CreatorWallet> {
    await this.delay(100);
    this.ensureWallet(creatorId);
    return { ...this.wallets.get(creatorId)! };
  }

  /**
   * Calcula payout pendiente
   */
  async calculatePendingPayout(creatorId: string): Promise<number> {
    await this.delay(100);
    this.ensureWallet(creatorId);
    return this.wallets.get(creatorId)!.pendingBalance;
  }

  /**
   * Obtiene revenue total
   */
  async getTotalRevenue(creatorId: string): Promise<number> {
    await this.delay(100);
    this.ensureWallet(creatorId);
    return this.wallets.get(creatorId)!.totalEarned;
  }
}
