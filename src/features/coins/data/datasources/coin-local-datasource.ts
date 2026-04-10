/**
 * Coin Local DataSource
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoinPackage } from '../../domain/entities';

export class CoinLocalDataSource {
  private balance: number = 0;

  private async getStorageKey(): Promise<string> {
    const email = await AsyncStorage.getItem('@mangaty_email');
    return email ? `@mangaty_coins_${email}` : '@mangaty_coins_guest';
  }

  private packages: CoinPackage[] = [
    {
      id: '100',
      coins: 100,
      bonus: 0,
      price: '$20 MXN',
      priceMXN: 20,
      popular: false,
      best: false
    },
    {
      id: '250',
      coins: 250,
      bonus: 30,
      price: '$45 MXN',
      priceMXN: 45,
      popular: false,
      best: false
    },
    {
      id: '600',
      coins: 600,
      bonus: 100,
      price: '$100 MXN',
      priceMXN: 100,
      popular: true,
      best: false
    },
    {
      id: '1300',
      coins: 1300,
      bonus: 300,
      price: '$200 MXN',
      priceMXN: 200,
      popular: false,
      best: false
    },
    {
      id: '3500',
      coins: 3500,
      bonus: 1000,
      price: '$500 MXN',
      priceMXN: 500,
      popular: false,
      best: true
    },
  ];

  async getBalance(): Promise<number> {
    const key = await this.getStorageKey();
    const saved = await AsyncStorage.getItem(key);
    if (saved !== null) {
      this.balance = parseInt(saved, 10);
    } else {
      this.balance = 0;
    }
    return this.balance;
  }

  async getPurchasePackages(): Promise<CoinPackage[]> {
    return this.packages;
  }

  async purchaseCoins(packageId: string): Promise<boolean> {
    const pkg = this.packages.find((p) => p.id === packageId);
    if (pkg) {
      await this.getBalance(); // asegurar balance actualizado
      this.balance += pkg.coins + pkg.bonus;
      const key = await this.getStorageKey();
      await AsyncStorage.setItem(key, this.balance.toString());
      return true;
    }
    return false;
  }

  async watchAd(): Promise<boolean> {
    await this.getBalance();
    this.balance += 10;
    const key = await this.getStorageKey();
    await AsyncStorage.setItem(key, this.balance.toString());
    return true;
  }
}
