/**
 * Coin Repository Interface
 */

import { CoinPackage } from '../entities';

export interface ICoinRepository {
  getBalance(): Promise<number>;
  getPurchasePackages(): Promise<CoinPackage[]>;
  purchaseCoins(packageId: string): Promise<boolean>;
  watchAd(): Promise<boolean>;
  checkout(packageId: string, idempotencyKey: string): Promise<string>;
}
