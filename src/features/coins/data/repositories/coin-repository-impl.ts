/**
 * Coin Repository Implementation
 */

import { ICoinRepository } from '../../domain/repositories/coin-repository';
import { CoinLocalDataSource } from '../datasources/coin-local-datasource';

export class CoinRepositoryImpl implements ICoinRepository {
  constructor(private dataSource: CoinLocalDataSource) {}

  async getBalance(): Promise<number> {
    return this.dataSource.getBalance();
  }

  async getPurchasePackages() {
    return this.dataSource.getPurchasePackages();
  }

  async purchaseCoins(packageId: string): Promise<boolean> {
    return this.dataSource.purchaseCoins(packageId);
  }

  async watchAd(): Promise<boolean> {
    return this.dataSource.watchAd();
  }
}
