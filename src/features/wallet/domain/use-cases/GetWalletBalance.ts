/**
 * GetWalletBalance - Get current coin balance for a user
 */

import { IUserRepository } from '@/src/features/user/domain/repositories';

export class GetWalletBalance {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<number> {
    return this.userRepository.getCoinBalance(userId);
  }
}
