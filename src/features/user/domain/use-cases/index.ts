/**
 * User UseCases
 */

import { User } from '../entities';
import { IUserRepository } from '../repositories/user-repository';

export class GetUser {
  constructor(private repository: IUserRepository) {}

  async execute(): Promise<User | null> {
    return this.repository.getUser();
  }
}

export class UpdateUser {
  constructor(private repository: IUserRepository) {}

  async execute(user: Partial<User>): Promise<User> {
    return this.repository.updateUser(user);
  }
}

export class Logout {
  constructor(private repository: IUserRepository) {}

  async execute(): Promise<void> {
    return this.repository.logout();
  }
}
