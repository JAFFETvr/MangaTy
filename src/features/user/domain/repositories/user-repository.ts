/**
 * User Repository Interface
 */

import { User } from '../entities';

export interface IUserRepository {
  getUser(): Promise<User | null>;
  updateUser(user: Partial<User>): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  getUserCoinBalance(): Promise<number>;
  addCoins(amount: number): Promise<number>;
  spendCoins(amount: number): Promise<number>;
  logout(): Promise<void>;
}
