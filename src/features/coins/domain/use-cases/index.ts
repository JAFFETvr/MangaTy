/**
 * Coin UseCase
 */

import { ICoinRepository } from '../repositories/coin-repository';

export class GetCoinBalance {
  constructor(private repository: ICoinRepository) {}

  async execute(): Promise<number> {
    return this.repository.getBalance();
  }
}

export class GetCoinPackages {
  constructor(private repository: ICoinRepository) {}

  async execute() {
    return this.repository.getPurchasePackages();
  }
}

export class PurchaseCoins {
  constructor(private repository: ICoinRepository) {}

  async execute(packageId: string): Promise<boolean> {
    return this.repository.purchaseCoins(packageId);
  }
}

export class WatchAd {
  constructor(private repository: ICoinRepository) {}

  async execute(): Promise<boolean> {
    return this.repository.watchAd();
  }
}
