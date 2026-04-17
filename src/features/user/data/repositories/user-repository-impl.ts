/**
 * User Repository Implementation
 */

import { User } from '../../domain/entities';
import { IUserRepository } from '../../domain/repositories/user-repository';

export class UserRepositoryImpl implements IUserRepository {
  constructor(
    private dataSource: {
      getUser(): Promise<User | null>;
      updateUser(updates: Partial<User>): Promise<User>;
      uploadAvatar(imageUri: string): Promise<string>;
      changePassword(currentPassword: string, newPassword: string): Promise<void>;
      getUserCoinBalance(): Promise<number>;
      addCoins(amount: number): Promise<number>;
      spendCoins(amount: number): Promise<number>;
      logout(): Promise<void>;
    }
  ) {}

  async getUser(): Promise<User | null> {
    return this.dataSource.getUser();
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    return this.dataSource.updateUser(updates);
  }

  async uploadAvatar(imageUri: string): Promise<string> {
    return this.dataSource.uploadAvatar(imageUri);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.dataSource.changePassword(currentPassword, newPassword);
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
