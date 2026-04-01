/**
 * Coin Local DataSource
 */

import { CoinPackage } from '../../domain/entities';

export class CoinLocalDataSource {
  private balance: number = 50;

  private packages: CoinPackage[] = [
    { 
      id: '100', 
      coins: 100, 
      bonus: 0, 
      price: '$20', 
      priceMXN: 20, 
      popular: false, 
      best: false 
    },
    { 
      id: '250', 
      coins: 250, 
      bonus: 30, 
      price: '$45', 
      priceMXN: 45, 
      popular: false, 
      best: false 
    },
    { 
      id: '600', 
      coins: 600, 
      bonus: 100, 
      price: '$100', 
      priceMXN: 100, 
      popular: true, 
      best: false 
    },
    { 
      id: '1300', 
      coins: 1300, 
      bonus: 300, 
      price: '$200', 
      priceMXN: 200, 
      popular: false, 
      best: false 
    },
    { 
      id: '3500', 
      coins: 3500, 
      bonus: 1000, 
      price: '$500', 
      priceMXN: 500, 
      popular: false, 
      best: true 
    },
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
