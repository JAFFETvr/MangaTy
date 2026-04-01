/**
 * User Local DataSource
 */

import { User } from '../../domain/entities';

export class UserLocalDataSource {
  private user: User = {
    id: '1',
    name: 'Usuario',
    email: 'usuario@mail.com',
    coinBalance: 50,  // Balance inicial de monedas
    memberSince: new Date('2023-01-01'),
    stats: {
      mangasRead: 24,
      favorites: 12,
      chaptersRead: 156,
    },
  };

  async getUser(): Promise<User | null> {
    return { ...this.user };
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    this.user = { ...this.user, ...updates };
    return { ...this.user };
  }

  async getUserCoinBalance(): Promise<number> {
    return this.user.coinBalance;
  }

  async addCoins(amount: number): Promise<number> {
    this.user.coinBalance += amount;
    return this.user.coinBalance;
  }

  async spendCoins(amount: number): Promise<number> {
    if (this.user.coinBalance < amount) {
      throw new Error('Saldo insuficiente');
    }
    this.user.coinBalance -= amount;
    return this.user.coinBalance;
  }

  async logout(): Promise<void> {
    // Clear user session
  }
}
