/**
 * GetUserCoinBalance Use Case
 */

import { IUserRepository } from '../repositories/user-repository';

export class GetUserCoinBalance {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<number> {
    return this.userRepository.getUserCoinBalance();
  }
}
