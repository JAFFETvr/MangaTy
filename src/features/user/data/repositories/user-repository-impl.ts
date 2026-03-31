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

  async logout(): Promise<void> {
    return this.dataSource.logout();
  }
}
