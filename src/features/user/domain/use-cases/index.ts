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

export class ChangePassword {
  constructor(private repository: IUserRepository) {}

  async execute(currentPassword: string, newPassword: string): Promise<void> {
    return this.repository.changePassword(currentPassword, newPassword);
  }
}

export class UploadAvatar {
  constructor(private repository: IUserRepository) {}

  async execute(imageUri: string): Promise<string> {
    return this.repository.uploadAvatar(imageUri);
  }
}

export class Logout {
  constructor(private repository: IUserRepository) {}

  async execute(): Promise<void> {
    return this.repository.logout();
  }
}

// Export new use cases
export * from './GetUserCoinBalance';
export * from './SpendCoins';
export * from './ValidateUserBalance';

