/**
 * User Repository Interface
 */

import { User } from '../entities';

export interface IUserRepository {
  getUser(): Promise<User | null>;
  updateUser(user: Partial<User>): Promise<User>;
  logout(): Promise<void>;
}
