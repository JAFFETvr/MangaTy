/**
 * ValidateUserBalance Use Case - Validate if user has enough coins
 */

import { IUserRepository } from '../repositories/user-repository';

export class ValidateUserBalance {
  constructor(private userRepository: IUserRepository) {}

  async execute(requiredAmount: number): Promise<boolean> {
    const balance = await this.userRepository.getUserCoinBalance();
    return balance >= requiredAmount;
  }

  async executeOrThrow(requiredAmount: number): Promise<void> {
    const hasBalance = await this.execute(requiredAmount);
    if (!hasBalance) {
      const balance = await this.userRepository.getUserCoinBalance();
      throw new Error(
        `Saldo insuficiente. Tienes ${balance} monedas pero necesitas ${requiredAmount}.`
      );
    }
  }
}
