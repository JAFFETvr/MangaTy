/**
 * SpendCoins Use Case - Spend user coins
 */

import { IUserRepository } from '../repositories/user-repository';

export class SpendCoins {
  constructor(private userRepository: IUserRepository) {}

  async execute(amount: number, reason: string): Promise<number> {
    if (amount <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    try {
      const newBalance = await this.userRepository.spendCoins(amount);
      console.log(`[SpendCoins] Gastadas ${amount} monedas. Motivo: ${reason}. Nuevo balance: ${newBalance}`);
      return newBalance;
    } catch (error) {
      if (error instanceof Error && error.message === 'Saldo insuficiente') {
        throw new Error(`No tienes suficientes monedas. Necesitas ${amount} monedas.`);
      }
      throw error;
    }
  }
}
