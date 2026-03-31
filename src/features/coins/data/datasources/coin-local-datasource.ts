/**
 * Coin Local DataSource
 */

import { CoinPackage } from '../../domain/entities';

export class CoinLocalDataSource {
  private balance: number = 50;

  private packages: CoinPackage[] = [
    { id: '50', coins: 50, bonus: 0, price: '0.9', popular: false, best: false },
    { id: '120', coins: 120, bonus: 30, price: '1.9', popular: false, best: false },
    { id: '300', coins: 300, bonus: 50, price: '4.99', popular: true, best: false },
    { id: '1500', coins: 1500, bonus: 500, price: '19.99', popular: false, best: true },
    { id: '650', coins: 650, bonus: 180, price: '8.9', popular: false, best: false },
  ];

  async getBalance(): Promise<number> {
    return this.balance;
  }

  async getPurchasePackages(): Promise<CoinPackage[]> {
    return this.packages;
  }

  async purchaseCoins(packageId: string): Promise<boolean> {
    const pkg = this.packages.find((p) => p.id === packageId);
    if (pkg) {
      this.balance += pkg.coins + pkg.bonus;
      return true;
    }
    return false;
  }

  async watchAd(): Promise<boolean> {
    this.balance += 10;
    return true;
  }
}
