/**
 * Coin Repository Implementation
 */

import { ICoinRepository } from '../../domain/repositories/coin-repository';
import { CoinLocalDataSource } from '../datasources/coin-local-datasource';
import { CoinRemoteDataSource } from '../datasources/coin-remote-datasource';

export class CoinRepositoryImpl implements ICoinRepository {
  constructor(
    private localDataSource: CoinLocalDataSource,
    private remoteDataSource: CoinRemoteDataSource
  ) {}

  async getBalance(): Promise<number> {
    return this.localDataSource.getBalance();
  }

  async getPurchasePackages() {
    return this.remoteDataSource.getPackages();
  }

  async purchaseCoins(packageId: string): Promise<boolean> {
    return this.localDataSource.purchaseCoins(packageId);
  }

  async watchAd(): Promise<boolean> {
    return this.localDataSource.watchAd();
  }

  async checkout(packageId: string, idempotencyKey: string): Promise<string> {
    return this.remoteDataSource.checkout(packageId, idempotencyKey);
  }
}
