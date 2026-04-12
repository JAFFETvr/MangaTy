/**
 * User Repository Implementation
 */

import { User } from '../../domain/entities';
import { IUserRepository } from '../../domain/repositories/user-repository';
import { UserLocalDataSource } from '../datasources/user-local-datasource';

export class UserRepositoryImpl implements IUserRepository {
  constructor(private dataSource: UserLocalDataSource) {}

  async getUser(): Promise<User | null> {
    return this.dataSource.getUser();
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    return this.dataSource.updateUser(updates);
  }

  async getUserCoinBalance(): Promise<number> {
    return this.dataSource.getUserCoinBalance();
  }

  async addCoins(amount: number): Promise<number> {
    return this.dataSource.addCoins(amount);
  }

  async spendCoins(amount: number): Promise<number> {
    return this.dataSource.spendCoins(amount);
  }

  async logout(): Promise<void> {
    return this.dataSource.logout();
  }
}
